// paystack.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { IPaymentProvider } from './interface/payment-provider.interface';
import { envConfig } from '../core/config/env.config';

@Injectable()
export class PaystackService implements IPaymentProvider {
  private readonly paystackUrl = envConfig.paystack.url;
  private readonly paystackKey = envConfig.paystack.key;

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.paystackKey}`,
      'Accept-Encoding': 'gzip,deflate,compress',
    };
  }

  async initiatePayment({
    amount,
    email,
  }: {
    amount: number;
    email: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.paystackUrl}/transaction/initialize`,
        { amount: amount * 100, email },
        { headers: this.headers },
      );

      const data = response.data.data;

      if (!response.data.status)
        throw new BadRequestException('Error initiating payment');

      return {
        data: {
          authorizationUrl: data.authorization_url,
          accessCode: data.access_code,
          reference: data.reference,
        },
      };
    } catch (error) {
      return { success: false, msg: 'Unable to initiate payment' };
    }
  }

  async verifyCardPayment(payload: Record<string, string>): Promise<any> {
    return this.verifyProviderPayment(payload.reference);
  }

  async verifyProviderPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.paystackUrl}/transaction/verify/${reference}`,
        {
          headers: this.headers,
        },
      );

      const { status, gateway_response } = response.data.data;
      const isSuccess = status === 'success';

      return {
        success: isSuccess,
        msg: gateway_response,
        data: response.data.data,
      };
    } catch (error) {
      return { success: false, msg: 'Payment verification failed' };
    }
  }
}
