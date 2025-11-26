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
import { InvalidCredentialsException } from '../../domain/exceptions/InvalidCredentials.exception';
import { UserServiceClient } from '../../domain/interfaces/UserClient.interface';
import { AuthRepository } from '../../domain/repositories/Auth.repository';
import { AuthDomainService } from '../../domain/services/Auth.service';
import { LoginCommand } from '../commands/Login.command';
import { LoginResponse } from '../dtos/LoginResponse.dto';
import { AUTH_REPOSITORY } from '../InjectionToken';

@CommandHandler(LoginCommand)
export class LoginCommandHandler
  implements
    ICommandHandler<LoginCommand, ApiResponse<LoginResponse>>,
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

  async execute(command: LoginCommand): Promise<ApiResponse<LoginResponse>> {
    const emailVO = EmailVO.create(command.email);

    const auth = await this.authRepository.findByEmail(emailVO.value);
    if (!auth) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.authDomainService.comparePassword(
      command.password,
      auth.password,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const userResponse = await firstValueFrom(
      this.userService.getUserByEmail({ email: emailVO.value }),
    );

    if (!userResponse.found) {
      throw new InvalidCredentialsException();
    }

    // Generate tokens
    const payload = { sub: userResponse.id, email: userResponse.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update auth record with refresh token
    auth.updateRefreshToken(refreshToken);
    auth.updateLastLogin();
    await this.authRepository.updateRefreshToken(auth.id, refreshToken);

    const res = {
      accessToken,
      refreshToken,
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
      },
    };
    return new LoginResponse(res).toResponse();
  }
}
