import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { MailService } from 'src/core/mail/email';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, email } = createUserDto;

      const validateUser = await this.userModel.findOne({ email });
      if (validateUser) throw new BadRequestException('Email already exist');

      // const hashedPassword = await hashPassword(password);

      const createdUser = await this.userModel.create({
        ...createUserDto,
        password,
        // password: hashedPassword,
      });

      try {
        await this.mailService.sendMailNotification(
          email,
          'Welcome',
          { name: createUserDto.name },
          'welcome',
        );
      } catch (error) {
        console.log('email notification error:', error);
      }

      createdUser.password = undefined;

      return createdUser;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const data = await this.userModel.findOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { password: 0 },
      );

      if (!data) throw new BadRequestException('user not found');

      return data;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }

  async update(
    id: string,
    updateUserDto: Pick<UpdateUserDto, 'name'>,
  ): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
        { ...updateUserDto },
        { new: true, runValidators: true },
      );
      if (!user) throw new BadRequestException('Unable to update user');
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        error?.response?.message ?? error?.message,
        error?.status ?? error?.statusCode ?? 500,
      );
    }
  }
}
