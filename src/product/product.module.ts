import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './product.controller';
import { ProductService } from './product.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    RedisModule,
  ],
  controllers: [ProductsController],
  providers: [ProductService],
})
export class ProductModule {}
