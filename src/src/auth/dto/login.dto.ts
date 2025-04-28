import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the artist/user',
    example: 'jane.smith@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the artist/user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
