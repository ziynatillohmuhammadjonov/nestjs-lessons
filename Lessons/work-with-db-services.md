# Konfiguratsiyalarni sozlash
Buning uchun `pnpm i @nestjs/config` ni o'rnatib keyin uni app.module.ts ga import qilib kerakmi joyda ishlatilaveriladi. 
```ts
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    AppController,
    AuthController,
    ProductController,
    ReviewController,
    TopPageController,
  ],
  providers: [AppService],
})
```
uni keyin kerakli fayllarda ishlatish uchun controller yoki servisda DI qilinadi

# DB ni ulash mongodbni ulash
Buning uchun dastlab kerakli papkalarni o'rnatib olamiz `@nestjs/mongoose mongoose` larni qo'shamiz loyihaga.
Keyin uni loyihani asosiga app.modulega import qilamiz. 
```ts
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfig,
    }),
    AuthModule,
  ],
  controllers: [
    AppController,
    AuthController,
    ProductController,
    ReviewController,
    TopPageController,
  ],
  providers: [AppService],
})
```
configlarni appmodul ichida yozish tavsiya qilinmaydi sababi unda app.module kotta bo'lib ketadi. Buni o'rniga src/congigs fayligai yozishni tavsiya qilinadi. Misol bizfa `mongo.config.ts` ichiga yozamiz.
```ts
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<MongooseModuleOptions> => {
  return {
    uri: getMongoString(configService),
    // Mongoose 6+ versiyalarida useNewUrlParser va useUnifiedTopology shart emas (default true)
  };
};

const getMongoString = (configService: ConfigService) =>
  `mongodb://${configService.get('MONGO_LOGIN')}:${configService.get('MONGO_PASSWORD')}@` +
  `${configService.get('MONGO_HOST')}:${configService.get('MONGO_PORT')}/` +
  `${configService.get('MONGO_DATABASE')}?authSource=${configService.get('MONGO_AUTHDATABASE')}`;
```
keyin mos ravishda kerakli modullarda biz ochgan modellarni dbga o'zgartirib chiqamiz. Shunda ularni dbda ishlatiladigan table sifatida ishlata olamiz. 
Endi uni bizdagi modullarga ulaymiz ishlatishim uchun. Dastlab ishni modelni o'zgartirishdan boshlaymi. Bunda modelga qatorlarni migratsiya fayliga o'xshatib o'zgartirib chiqamiz mongo uchun.
```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<AuthModel>;

@Schema({ timestamps: true, collection: 'Auth' }) //collection nomidan modulda foydalaniladi
export class AuthModel {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;
}

export const AuthSchema = SchemaFactory.createForClass(AuthModel);
```
Keyin bu migratsiya faylni mos ravishda auth.modulga ulasak avtomatik ravishda migrate bo'ladi db ga yangi table.
```typescript-eslint
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModel, AuthSchema } from './auth.model';

@Module({
  controllers: [AuthController],
  imports: [
    MongooseModule.forFeature([
      {
        name: AuthModel.name,
        schema: AuthSchema,
      },
    ]),
  ],
})
export class AuthModule {}
``` 
Agar collection ni bermasak defaul model nomini misol AuthModelni collection nomi sifatida oladi.

# Servislar
Servislarni ochish uchun `nest g service <servis-nom>` kiritiladi.
Servislarga modelni bog'lash uchun (db modelni) servis ichida uni DI qilinadi. 
```ts
  constructor(
    @InjectModel(ReviewModel.name)
    private readonly reviewModel: Model<ReviewModel>,
  ) {}
```
keyin uni ichida istalgancha modeldan foydalanib ishlanaveradi. Keyin servisni ishlatish uchun kontrollerga ham uni DI qilib ishlatiladi.
```ts
  constructor(private readonly reviewService: ReviewService) {}
```
