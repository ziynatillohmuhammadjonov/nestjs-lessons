import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

// async va Promise olib tashlandi, chunki ichida await yo'q
export const getJWTConfig = (
  configService: ConfigService,
): JwtModuleOptions => {
  const secret = configService.get<string>('JWT_SECRET');

  if (!secret) {
    throw new Error('JWT_SECRET topilmadi!');
  }

  return {
    secret: secret,
  };
};
