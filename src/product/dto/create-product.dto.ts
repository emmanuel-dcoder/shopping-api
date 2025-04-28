import {
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product stock quantity' })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Product active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateStockDto {
  @ApiProperty({
    description:
      'Quantity to update (positive for increase, negative for decrease)',
  })
  @IsNumber()
  quantity: number;
}
