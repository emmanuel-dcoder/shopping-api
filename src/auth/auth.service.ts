import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { comparePassword } from 'src/core/common/util/utility';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // async validateUser(email: string, pass: string): Promise<any> {
  //   try {
  //     let user = await this.userModel.findOne({ email });

  //     if (!user || !(await comparePassword(pass, user.password))) {
  //       throw new BadRequestException('Invalid email or password');
  //     }
  //     const { password, ...result } = user.toObject();
  //     return result;
  //   } catch (error) {
  //     throw new HttpException(
  //       error?.response?.message ?? error?.message,
  //       error?.status ?? error?.statusCode ?? 500,
  //     );
  //   }
  // }

  // async login(user: { _id: string; email: string }) {
  //   try {
  //     const payload = {
  //       _id: user._id,
  //       email: user.email,
  //       sub: user._id,
  //     };
  //     return {
  //       _id: user._id,
  //       email: user.email,
  //       access_token: this.jwtService.sign(payload),
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       error?.response?.message ?? error?.message,
  //       error?.status ?? error?.statusCode ?? 500,
  //     );
  //   }
  // }
}
