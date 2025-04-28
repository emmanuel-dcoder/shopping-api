import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { successResponse } from 'src/core/config/response';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // //user login
  // @Post('user/login')
  // @ApiOperation({ summary: 'User Login and get JWT token' })
  // @ApiBody({ type: LoginDto })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Login successful',
  //   type: Object,
  //   example: { access_token: 'jwt.token.here' },
  // })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // async userLogin(@Body() loginDto: LoginDto) {
  //   const user = await this.authService.validateUser(
  //     loginDto.email,
  //     loginDto.password,
  //   );
  //   const data = await this.authService.login(user);
  //   return successResponse({
  //     message: 'Login successful',
  //     code: HttpStatus.OK,
  //     status: 'success',
  //     data,
  //   });
  // }
}
