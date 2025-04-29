import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { successResponse } from '../core/config/response';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@ApiTags('Cart')
@Controller('api/v1/cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartsService: CartService) {}

  @Get(':userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOperation({ summary: 'Get cart by user ID' })
  @ApiResponse({ status: 200, description: 'Cart Details' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async getCart(@Param('userId') userId: string) {
    const data = await this.cartsService.getCart(userId);
    return successResponse({
      message: 'Cart Details',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Post()
  @ApiBody({ type: AddToCartDto })
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Cart added successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    const data = await this.cartsService.addToCart(addToCartDto);
    return successResponse({
      message: 'Cart added successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Patch()
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateCartItem(@Body() updateCartItemDto: UpdateCartItemDto) {
    const data = await this.cartsService.updateCartItem(updateCartItemDto);
    return successResponse({
      message: 'Cart updated successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Delete(':userId/items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'userId', type: String })
  @ApiParam({ name: 'productId', type: String })
  @ApiResponse({ status: 200, description: 'Item removed from Cart' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async removeFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    const data = await this.cartsService.removeFromCart(userId, productId);
    return successResponse({
      message: 'Item removed from Cart',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async clearCart(@Param('userId') userId: string) {
    const data = await this.cartsService.clearCart(userId);
    return successResponse({
      message: 'Cart cleared successfully',
      code: HttpStatus.OK,
      status: 'success',
      data,
    });
  }
}
