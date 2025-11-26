import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CreateUserRequest,
  CreateUserResponse,
  GetUserByEmailRequest,
  GetUserByEmailResponse,
} from '../../../auth/domain/interfaces/UserClient.interface';
import { GRPC_USER_SERVICE_NAME } from '../../../shared/infrastructure/grpc/GrpcConfig';
import { USER_REPOSITORY } from '../../application/InjectionToken';
import { UserEntity } from '../../domain/entities/User.entity';
import { GRPC_USER_SERVICE } from '../../domain/enums/GrpcUser.enum';
import { UserRepository } from '../../domain/repositories/User.repository';

@Controller()
export class UserGrpcController {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @GrpcMethod(GRPC_USER_SERVICE_NAME, GRPC_USER_SERVICE.GET_USER_BY_EMAIL)
  async getUserByEmail(
    request: GetUserByEmailRequest,
  ): Promise<GetUserByEmailResponse | null> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      return null;
    }

    return {
      found: true,
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @GrpcMethod(GRPC_USER_SERVICE_NAME, GRPC_USER_SERVICE.CREATE_USER)
  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    const user = UserEntity.create({
      email: request.email,
      name: request.name,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
    };
  }
}
