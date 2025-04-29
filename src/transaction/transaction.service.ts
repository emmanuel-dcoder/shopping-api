import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../order/schemas/order.schema';
import * as crypto from 'crypto';
import { envConfig } from '../core/config/env.config';

@Injectable()
export class TransactionService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}
  verifyWebhookSignature(body: any, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', envConfig.paystack.key)
      .update(JSON.stringify(body))
      .digest('hex');

    return hash === signature;
  }

  async handlePaystackEvent(event: any) {
    //verify transaction
    const order = await this.orderModel.findOne({
      reference: event.data.reference,
    });

    if (!order) throw new BadRequestException('Invalid order');

    if (order.status !== 'pending')
      throw new BadRequestException('Likely duplicate order or invalid order');

    if (event.event === 'charge.success') {
      //update order status
      await this.orderModel
        .findOneAndUpdate(
          { reference: event.data.reference },
          { status: 'completed' },
          { new: true },
        )
        .exec();
    } else {
      await this.orderModel
        .findOneAndUpdate(
          { reference: event.data.reference },
          { status: 'cancelled' },
          { new: true },
        )
        .exec();
    }

    return { message: 'Payment verified' };
  }
}
