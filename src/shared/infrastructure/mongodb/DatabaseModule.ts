import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config } from 'libs/config/Config';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(Config.DATABASE_URL, {
      autoCreate: true,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
