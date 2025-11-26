import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_REPOSITORY } from './application/InjectionToken';
import { UserCreateCommandHandler } from './application/handlers/UserCreate.command.handler';
import { UserGetDetailHandler } from './application/handlers/UserGetDetail.query.handler';
import { UserModel, UserSchema } from './infrastructure/models/User.model';
import { UserRepositoryImpl } from './infrastructure/repositories/UserImpl.repository';
import { UserGrpcController } from './presentation/grpc/UserGrpc.controller';
import { UserController } from './presentation/http/controllers/User.controller';

const CommandHandlers = [UserCreateCommandHandler];
const QueryHandlers = [UserGetDetailHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [UserGrpcController, UserController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
