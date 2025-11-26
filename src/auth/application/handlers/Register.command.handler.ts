import { Inject, OnModuleInit } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EmailVO } from '../../../shared/domain/value-objects/Email.vo';
import {
  GRPC_PACKAGES,
  GRPC_USER_SERVICE_NAME,
} from '../../../shared/infrastructure/grpc/GrpcConfig';
import { ApiResponse } from '../../../shared/presentation/dto/Response';
import { AuthEntity } from '../../domain/entities/Auth.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/UserAlreadyExists.exception';
import { UserServiceClient } from '../../domain/interfaces/UserClient.interface';
import { AuthRepository } from '../../domain/repositories/Auth.repository';
import { AuthDomainService } from '../../domain/services/Auth.service';
import { PasswordVO } from '../../domain/valueobjects/Password.vo';
import { RegisterCommand } from '../commands/Register.command';
import { RegisterResponse } from '../dtos/RegisterResponse.dto';
import { AUTH_REPOSITORY } from '../InjectionToken';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler
  implements
    ICommandHandler<RegisterCommand, ApiResponse<RegisterResponse>>,
    OnModuleInit
{
  private userService: UserServiceClient;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
    @Inject(GRPC_PACKAGES.USER)
    private readonly userClient: ClientGrpc,
    private readonly authDomainService: AuthDomainService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserServiceClient>(
      GRPC_USER_SERVICE_NAME,
    );
  }

  async execute(
    command: RegisterCommand,
  ): Promise<ApiResponse<RegisterResponse>> {
    const emailVO = EmailVO.create(command.email);
    new PasswordVO(command.password);

    const existingUser = await firstValueFrom(
      this.userService.getUserByEmail({ email: emailVO.value }),
    );

    if (existingUser.found) {
      throw new UserAlreadyExistsException(emailVO.value);
    }

    const hashedPassword = await this.authDomainService.hashPassword(
      command.password,
    );

    const createdUser = await firstValueFrom(
      this.userService.createUser({
        email: emailVO.value,
        name: command.name || emailVO.value.split('@')[0],
      }),
    );

    const auth = AuthEntity.create({
      email: emailVO.value,
      password: hashedPassword,
    });
    auth.id = createdUser.id;

    const savedAuth = await this.authRepository.save(auth);

    const payload = { sub: createdUser.id, email: createdUser.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    savedAuth.updateRefreshToken(refreshToken);
    await this.authRepository.updateRefreshToken(savedAuth.id, refreshToken);

    const res = {
      accessToken,
      refreshToken,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
    };
    return new RegisterResponse(res).toResponse();
  }
}
