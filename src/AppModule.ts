import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { RequestStorageMiddleware } from 'libs/RequestStorageMiddleware';
import { DatabaseModule } from 'src/shared/infrastructure/mongodb/DatabaseModule';

import { AppController } from 'src/AppController';
import { AppService } from 'src/AppService';
import { AuthModule } from 'src/auth/AuthModule';
import { UserModule } from 'src/user/UserModule';
import { RabbitmqModule } from './shared/infrastructure/rabbitmq/Rabbitmq.module';
import { RedisModule } from './shared/infrastructure/redis/Redis.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    DatabaseModule,
    ThrottlerModule.forRoot(),
    ScheduleModule.forRoot(),
    RabbitmqModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestStorageMiddleware).forRoutes('*');
  }
}
