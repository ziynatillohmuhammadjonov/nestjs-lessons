Dastlab userni ro'yxatdan o'tkazish uchun uni bazaga saqalaymiz. Bunda userni ma'lumotlarini ochiq holda qoldirmaslik uchun misol password qatorini uni bcrypt qilish kerak. Buning uchun `bcryptjs` paketini loyihaga o'rnatamiz.
Avvallari mijoz saytga kirganda unga session key berilib shu asosida bekend bilan ishlar edi. Lekin keyinchalik SPA ishlagandan keyin sahifaga faqat http so'rovlar berishni boshlagandan keyin session ishlamay qoldi va shunda JWT keldi. JWT uch qisimdan iborat:
1. Algoritm va kontent turi
2. Malumot bizniki
3. Imzo

JWT ni ishlatish uchun nestda o'zini paketini o'rnatiladi `@nestjs/jwt` keyin uni kerakli modelga inject qilib servisda ishlatiladi. Shunda biz jwt imzoni tekshiradi va u asosida ishlaydi. Agar imzo mos kelmasa xatolik berib 401 berib yuboradi.

Endi uni routlarni tokenni olib ishlash uchun strategiya qilinadi. Buni qo'shimcha paket orqali qilamiz. `@nestjs/passport passport passport-jwt` ts uchun esa `-D @types/passport-jwt`. Keyin dastlab kerakli modulga `PassportModule` ni import qilamiz.  
Keyin kerakli joyga alohida stratey faylini ochib unda token qayerdan kelishi va uni tekshib nimalar ni yuborishimizni ko'rsatamiz.
```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserModel } from '../user.model';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authServise: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET topilmadi!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate({ email }: Pick<UserModel, 'email'>) {
    const user = await this.authServise.findUser(email); // Bu yerda await bor
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```
Keyin uni kerakli modulga import qilib qo'yamiz providerlarga. Eslatma shunda modulga agar strategy ichida boshqa moduldan import bo'lsa qo'shi qo'yishimiz kerak. 
```ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './user.model';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJWTConfig } from 'src/configs/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
    PassportModule,
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```
Keyin esa alohida guard fayl ochib unda qaysi strategy dan foydalanayotganimizni ko'rsatamiz. Keyin shu guardni mos ravishda kontrollerlarda ishlatamiz.
```ts
import { AuthGuard } from '@nestjs/passport';

// quyidagi jwt bu strategy e'lon qilinganda uni ichiga berilgan Strategy ni default qilymati. Uni custom qilsa ham bo'ladi.
export class JwtAuthGuard extends AuthGuard('jwt') {}
```
Uni ishlatish uchun kontrollerda @UseGuard(GuardName) dan foydalanamiz.
```ts

import { DeleteResult, isValidObjectId } from 'mongoose';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { REVIEW_CONSTANTS } from './review.constants';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserEmail } from 'src/decorators/user-email.decorator';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
  async created(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    if (!isValidObjectId(id)) {
      throw new HttpException(
        REVIEW_CONSTANTS.BAD_GETWAY,
        HttpStatus.BAD_GATEWAY,
      );
    }
    const delDoc = await this.reviewService.delete(id);
    if (!delDoc) {
      throw new HttpException(REVIEW_CONSTANTS.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return delDoc;
  }

  @UseGuards(JwtAuthGuard)
  @Get('byProduct/:productId')
  async getByProduct(
    @Param('productId') productId: string,
    @CurrentUser() user: any,
  ) {
    console.log(user);
    return this.reviewService.findByProductId(productId);
  }

  @Delete('byProduct/:productId/delete')
  async deleteProductByProductId(
    @Param('productId') productId: string,
  ): Promise<DeleteResult> {
    return this.reviewService.deleteProductByProductId(productId);
  }
}
```
Har safar u strategiya qaytargan qiymatni request.user qilib olmaslik uchun biz custom decoratordan foydalanib unda bu request userni ilib olib berishimiz mumkin.
```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserModel } from 'src/auth/user.model';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    {
      const request: Request = ctx.switchToHttp().getRequest();
      return request.user as UserModel;
    }
  },
);
```
