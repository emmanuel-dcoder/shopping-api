import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { TransactionsController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionService],
})
export class TransactionModule {}
