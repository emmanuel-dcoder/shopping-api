import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto, UpdateStockDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly redisService: RedisService,
  ) {}

  //create a new product
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const newProduct = new this.productModel(createProductDto);
      const product = await newProduct.save();

      if (!product) throw new BadRequestException('Error creating product');

      // Clear products cache
      await this.redisService.del('all_products');

      return product;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const cacheKey = `all_products_${page}_${limit}`;

      const cachedProducts = await this.redisService.get(cacheKey);
      if (cachedProducts) {
        return cachedProducts as {
          products: Product[];
          total: number;
          page: number;
          limit: number;
        };
      }

      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        this.productModel.find().skip(skip).limit(limit).exec(),
        this.productModel.countDocuments().exec(),
      ]);

      const result = { products, total, page, limit };

      await this.redisService.set(cacheKey, result, 60);

      return result;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
  // Get a product by ID
  async findOne(id: string): Promise<Product> {
    try {
      const cacheKey = `product_${id}`;

      // Try to get from cache
      const cachedProduct = await this.redisService.get(cacheKey);
      if (cachedProduct) {
        return cachedProduct as Product;
      }

      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.redisService.set(cacheKey, product, 300);

      return product;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Update a product
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const product = await this.productModel
        .findByIdAndUpdate(id, { $set: updateProductDto }, { new: true })
        .exec();

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.redisService.del(`product_${id}`);
      await this.redisService.del('all_products');

      return product;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Update product stock with optimistic locking to handle concurrency
  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    // Implementation with retry logic to handle potential race conditions
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const product = await this.productModel.findById(id).exec();
        if (!product) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const newStockQuantity =
          product.stockQuantity + updateStockDto.quantity;

        // Check if stock would go negative
        if (newStockQuantity < 0) {
          throw new BadRequestException('Not enough stock available');
        }

        // Attempt to update with optimistic concurrency control
        const updatedProduct = await this.productModel
          .findOneAndUpdate(
            {
              _id: id,
              stockQuantity: product.stockQuantity, // Ensure the stock hasn't changed
            },
            {
              $inc: { stockQuantity: updateStockDto.quantity },
            },
            { new: true },
          )
          .exec();

        if (!updatedProduct) {
          // If no document was updated, it means there was a concurrent modification
          retries++;
          continue;
        }

        await this.redisService.del(`product_${id}`);

        return updatedProduct;
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
            'Failed to update stock after multiple attempts',
          );
        }
      }
    }
  }

  // Check if a product has sufficient stock
  async checkStock(id: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.findOne(id);
      return product.stockQuantity >= quantity;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Reserve stock for a product (used during checkout)
  async reserveStock(id: string, quantity: number): Promise<void> {
    try {
      const updateResult = await this.updateStock(id, { quantity: -quantity });
      if (!updateResult) {
        throw new BadRequestException(
          `Failed to reserve stock for product ${id}`,
        );
      }
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  // Release reserved stock (used if checkout fails)
  async releaseStock(id: string, quantity: number): Promise<void> {
    await this.updateStock(id, { quantity });
  }

  // Delete a product
  async remove(id: string): Promise<void> {
    try {
      const result = await this.productModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.redisService.del(`product_${id}`);
      await this.redisService.del('all_products');
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
