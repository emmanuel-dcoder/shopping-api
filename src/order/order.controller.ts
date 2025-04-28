import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './enum/order-enum';

@ApiTags('Order')
@Controller('api/v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 200, description: 'Redirect to Paystack for payment' })
  @ApiResponse({
    status: 400,
    description: 'Error initializing payment for order',
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const data = await this.orderService.createOrder(createOrderDto);
    return successResponse({
      message: 'Redirect to Paystack for payment',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all orders for a user with pagination' })
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiResponse({ status: 200, description: 'List of Orders' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  // @UseInterceptors(CacheInterceptor)
  async getUserOrders(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
  ) {
    const data = await this.orderService.getUserOrders(
      userId,
      +page,
      +limit,
      status,
    );
    return successResponse({
      message: 'List of Orders',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  // @UseInterceptors(CacheInterceptor)
  async getOrderById(@Param('id') id: string) {
    const data = await this.orderService.getOrderById(id);
    return successResponse({
      message: 'Order details',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
