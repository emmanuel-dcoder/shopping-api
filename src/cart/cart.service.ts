import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/create-cart.dto';
import { ProductService } from '../product/product.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productsService: ProductService,
    private readonly redisService: RedisService,
  ) {}

  // Get cart by user ID
  async getCart(userId: string): Promise<Cart> {
    try {
      const cacheKey = `cart_${userId}`;

      // Try to get from cache
      const cachedCart = await this.redisService.get(cacheKey);
      if (cachedCart) {
        return cachedCart as Cart;
      }

      let cart = await this.cartModel.findOne({ userId });

      // Create a new cart if it doesn't exist
      if (!cart) {
        cart = await this.cartModel.create({
          userId,
          items: [],
          totalAmount: 0,
        });
      }

      await this.redisService.set(cacheKey, cart, 60);

      return cart;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Add item to cart
  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    const { userId, item } = addToCartDto;

    // Check if product exists and has enough stock
    const product = await this.productsService.findOne(item.productId);
    console.log('product', product);
    if (product.stockQuantity < item.quantity) {
      throw new BadRequestException(
        `Not enough stock available for product ${product.name}`,
      );
    }

    // Find or create cart  for concurrency control
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const cart = await this.getCart(userId);

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
          (cartItem) => cartItem.productId.toString() === item.productId,
        );

        let updatedCart;

        if (existingItemIndex !== -1) {
          // Update existing item
          const existingItem = cart.items[existingItemIndex];
          const newQuantity = existingItem.quantity + item.quantity;

          // Check if new quantity exceeds available stock
          if (newQuantity > product.stockQuantity) {
            throw new BadRequestException(
              `Adding ${item.quantity} more would exceed available stock`,
            );
          }

          updatedCart = await this.cartModel.findOneAndUpdate(
            {
              userId,
              'items.productId': item.productId,
            },
            {
              $inc: {
                'items.$.quantity': item.quantity,
                totalAmount: item.quantity * product.price,
              },
            },
            { new: true },
          );
        } else {
          // Add new item
          updatedCart = await this.cartModel.findOneAndUpdate(
            { userId },
            {
              $push: {
                items: {
                  productId: item.productId,
                  quantity: item.quantity,
                  name: product.name,
                  price: product.price,
                },
              },
              $inc: { totalAmount: item.quantity * product.price },
            },
            { new: true },
          );
        }

        if (!updatedCart) {
          retries++;
          continue;
        }

        await this.redisService.del(`cart_${userId}`);

        return updatedCart;
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }

        retries++;
        if (retries >= maxRetries) {
          throw new BadRequestException(
            'Failed to update cart after multiple attempts',
          );
        }
      }
    }
  }

  // Update cart item quantity
  async updateCartItem(updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    try {
      const { userId, productId, quantity } = updateCartItemDto;

      // Get current cart
      const cart = await this.getCart(userId);

      // Find the item in the cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );
      if (!existingItem) {
        throw new NotFoundException(`Product ${productId} not found in cart`);
      }

      if (quantity === 0) {
        return this.removeFromCart(userId, productId);
      }

      // Check if product exists and has enough stock
      const product = await this.productsService.findOne(productId);
      if (product.stockQuantity < quantity) {
        throw new BadRequestException(
          `Not enough stock available for product ${product.name}`,
        );
      }

      // Calculate price difference
      const priceDifference =
        (quantity - existingItem.quantity) * product.price;

      // Update cart with optimistic concurrency control
      const updatedCart = await this.cartModel.findOneAndUpdate(
        {
          userId,
          'items.productId': productId,
        },
        {
          $set: { 'items.$.quantity': quantity },
          $inc: { totalAmount: priceDifference },
        },
        { new: true },
      );

      if (!updatedCart) {
        throw new ConflictException('Cart was modified. Please try again.');
      }

      await this.redisService.del(`cart_${userId}`);

      return updatedCart;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    try {
      const cart = await this.getCart(userId);

      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );
      if (!existingItem) {
        throw new NotFoundException(`Product ${productId} not found in cart`);
      }

      // Calculate amount to subtract from total
      const amountToSubtract = existingItem.quantity * existingItem.price;

      // Update cart with optimistic concurrency control
      const updatedCart = await this.cartModel.findOneAndUpdate(
        { userId },
        {
          $pull: { items: { productId } },
          $inc: { totalAmount: -amountToSubtract },
        },
        { new: true },
      );

      if (!updatedCart) {
        throw new ConflictException('Cart was modified. Please try again.');
      }

      await this.redisService.del(`cart_${userId}`);

      return updatedCart;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Clear cart
  async clearCart(userId: string): Promise<Cart> {
    try {
      const updatedCart = await this.cartModel.findOneAndUpdate(
        { userId },
        {
          $set: { items: [], totalAmount: 0 },
        },
        { new: true, upsert: true },
      );

      await this.redisService.del(`cart_${userId}`);

      return updatedCart;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
