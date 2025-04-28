import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { CartModule } from 'src/cart/cart.module';
import { ProductModule } from 'src/product/product.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UserService } from 'src/user/user.service';
import { CartService } from 'src/cart/cart.service';
import { ProductService } from 'src/product/product.service';
import { PaystackService } from 'src/provider/paystack.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { MailService } from 'src/core/mail/email';
import { Cart, CartSchema } from 'src/cart/schemas/cart.schema';
import { Product, ProductSchema } from 'src/product/schemas/product.schema';

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
