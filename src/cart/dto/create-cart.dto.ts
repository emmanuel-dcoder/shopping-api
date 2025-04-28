// src/modules/carts/dto/cart.dto.ts
import {
  IsString,
  IsNumber,
  IsMongoId,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ description: 'id of the product' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'quantity of product', example: 3 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AddToCartDto {
  @ApiProperty({ description: 'id of the user' })
  @IsString()
  userId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CartItemDto)
  item: CartItemDto;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'id of the user' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'id of the product' })
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CartResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty()
  totalAmount: number;
}
