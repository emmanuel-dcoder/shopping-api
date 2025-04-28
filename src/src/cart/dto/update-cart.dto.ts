import { PartialType } from '@nestjs/swagger';
import { CartItemDto } from './create-cart.dto';

export class UpdateCartDto extends PartialType(CartItemDto) {}
