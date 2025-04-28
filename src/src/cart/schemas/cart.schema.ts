import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class CartItem {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop()
  name: string;

  @Prop()
  price: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ default: 0 })
  totalAmount: number;
}
export const CartSchema = SchemaFactory.createForClass(Cart);
