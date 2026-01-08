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
