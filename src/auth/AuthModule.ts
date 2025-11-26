import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AuthController } from './presentation/http/controllers/Auth.Controller';

import { LoginCommandHandler } from './application/handlers/Login.command.handler';
import { LogoutCommandHandler } from './application/handlers/Logout.command.handler';
import { RefreshTokenCommandHandler } from './application/handlers/RefreshToken.command.handler';
import { RegisterCommandHandler } from './application/handlers/Register.command.handler';

import { AuthDomainService } from './domain/services/Auth.service';

import { Config } from '../../libs/config/Config';
import { AUTH_REPOSITORY } from './application/InjectionToken';
import { AuthModel, AuthSchema } from './infrastructure/models/Auth.model';
import { AuthRepositoryImpl } from './infrastructure/repositories/AuthImpl.repository';
import { JwtStrategy } from './presentation/strategies/Jwt.strategy';
import { GRPC_PACKAGES } from '../shared/infrastructure/grpc/GrpcConfig';

const CommandHandlers = [
  RegisterCommandHandler,
  LoginCommandHandler,
  RefreshTokenCommandHandler,
  LogoutCommandHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: Config.JWT_SECRET,
      signOptions: { expiresIn: +Config.JWT_EXPIRES_IN },
    }),
    MongooseModule.forFeature([{ name: AuthModel.name, schema: AuthSchema }]),
    ClientsModule.register([
      {
        name: GRPC_PACKAGES.USER,
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../shared/infrastructure/protos/user.proto'),
          url: Config.USER_GRPC_URL,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    AuthDomainService,
    JwtStrategy,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepositoryImpl,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
