import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './product.controller';
import { ProductService } from './product.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CacheModule.register(),
  ],
  controllers: [ProductsController],
  providers: [ProductService],
})
export class ProductModule {}
