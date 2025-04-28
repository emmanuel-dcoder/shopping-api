import { Body, Controller, Headers, HttpCode, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionService } from './transaction.service';

@ApiTags('api/v1/Transaction')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionService) {}

  //wehhook for payment verification
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Res() res: Response,
  ) {
    const isValid = this.transactionsService.verifyWebhookSignature(
      body,
      signature,
    );
    if (isValid) {
      await this.transactionsService.handlePaystackEvent(body);
    }
    return res.sendStatus(200);
  }
}
