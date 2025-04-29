import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './schemas/cart.schema';
import { ProductModule } from '../product/product.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductService } from '../product/product.service';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    ProductModule,
    RedisModule,
  ],
  controllers: [CartController],
  providers: [CartService, ProductService],
})
export class CartModule {}
