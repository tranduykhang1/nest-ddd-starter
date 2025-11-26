import { Global, Module } from '@nestjs/common';
import { RedisService } from './Redis.service';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
