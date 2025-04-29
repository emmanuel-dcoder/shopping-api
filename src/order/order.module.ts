import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { PaystackService } from '../provider/paystack.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { MailService } from '../core/mail/email';
import { Cart, CartSchema } from '../cart/schemas/cart.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    CartModule,
    ProductModule,
    CacheModule.register(),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    UserService,
    CartService,
    ProductService,
    PaystackService,
    MailService,
  ],
})
export class OrderModule {}
