import {
  Injectable,
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { OrderStatus } from './enum/order-enum';
import { PaystackService } from '../provider/paystack.service';
import { UserService } from '../user/user.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private userService: UserService,
    private cartService: CartService,
    private productService: ProductService,
    private paystackService: PaystackService,
    private readonly redisService: RedisService,
  ) {}

  // Create a new order from cart
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId } = createOrderDto;

    //verify user
    const user = await this.userService.findOne(userId);
    if (!user) throw new BadRequestException('Invalid user');

    // Get user's cart
    const cart = await this.cartService.getCart(userId);

    // Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order from empty cart');
    }

    try {
      // Verify stock availability for all items and reserve stock
      for (const item of cart.items) {
        if (
          !(await this.productService.checkStock(item.productId, item.quantity))
        ) {
          throw new BadRequestException(
            `Not enough stock for product ${item.name}`,
          );
        }
      }

      // Create order items from cart items
      const orderItems = cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      //initialize paystack
      const initializePaystack = await this.paystackService.initiatePayment({
        amount: cart.totalAmount,
        email: user.email,
      });

      if (!initializePaystack.data) {
        throw new BadRequestException('Error initiating payment request');
      }

      // Create new order
      const newOrder = new this.orderModel({
        userId,
        items: orderItems,
        totalAmount: cart.totalAmount,
        status: OrderStatus.PENDING,
        reference: initializePaystack.data.reference,
      });

      await newOrder.save();

      // Update stock for each product
      for (const item of cart.items) {
        await this.productService.reserveStock(item.productId, item.quantity);
      }

      await this.cartService.clearCart(userId);

      await this.redisService.del(`user_orders_${userId}`);

      return initializePaystack.data;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Get all orders for a user with pagination
  async getUserOrders(
    userId: string,
    page = 1,
    limit = 10,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    try {
      const cacheKey = `user_orders_${userId}_${page}_${limit}_${status || ''}`;

      // Try to get from cache
      const cachedOrders = await this.redisService.get(cacheKey);
      if (cachedOrders) {
        return cachedOrders as {
          orders: Order[];
          total: number;
          page: number;
          limit: number;
        };
      }

      const filter: any = { userId };
      if (status) {
        filter.status = status;
      }

      const skip = (page - 1) * limit;

      // Execute query with pagination
      const [orders, total] = await Promise.all([
        this.orderModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.orderModel.countDocuments(filter).exec(),
      ]);

      const result = { orders, total, page, limit };

      await this.redisService.set(cacheKey, result, 60);

      return result;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    try {
      const cacheKey = `order_${id}`;

      // Try to get from cache
      const cachedOrder = await this.redisService.get(cacheKey);
      if (cachedOrder) {
        return cachedOrder as Order;
      }

      const order = await this.orderModel.findById(id).exec();

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      await this.redisService.set(cacheKey, order, 300); // TTL: 5 minutes

      return order;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async updateOrderStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    try {
      const { status } = updateOrderStatusDto;

      // Get current order
      const order = await this.getOrderById(id);

      // Handle special cases like cancellation
      if (
        status === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        // Return stock to inventory if cancelling an order
        for (const item of order.items) {
          await this.productService.releaseStock(item.productId, item.quantity);
        }
      }

      // Update order status
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      await this.redisService.del(`order_${id}`);
      await this.redisService.del(`user_orders_${order.userId}`);

      return updatedOrder;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
