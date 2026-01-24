import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO-da yo'q maydonlarni o'chirib tashlaydi (Xavfsizlik!)
      forbidNonWhitelisted: true, // DTO-da yo'q maydon kelsa, xato qaytaradi
      transform: true, // Kelayotgan ma'lumotni DTO tipiga avtomatik o'tkazadi
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
