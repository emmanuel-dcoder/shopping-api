import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    example: 'user@gmail.com',
    description: 'insert user email to be registered',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  amount: string;

  @ApiProperty()
  @IsUUID()
  user: string;
}
