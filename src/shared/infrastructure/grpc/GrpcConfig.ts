import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const GRPC_PACKAGES = {
  USER: 'USER_PACKAGE',
  AUTH: 'AUTH_PACKAGE',
} as const;

export const GRPC_USER_SERVICE_NAME = 'UserService';
export const GRPC_AUTH_SERVICE_NAME = 'AuthService';

export function createUserGrpcOptions(url: string = 'localhost:50053'): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../protos/user.proto'),
      url,
    },
  };
}

export function createAuthGrpcOptions(url: string = 'localhost:50052'): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: 'auth',
      protoPath: join(__dirname, '../protos/auth.proto'),
      url,
    },
  };
}
