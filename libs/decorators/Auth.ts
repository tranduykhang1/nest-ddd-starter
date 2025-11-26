import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiForbiddenResponse } from '@nestjs/swagger';
import { Request } from 'express';

import { PASSWORD_GENERATOR, PasswordGenerator } from './PasswordModule';

@Injectable()
class AuthGuard implements CanActivate {
  @Inject(PASSWORD_GENERATOR)
  private readonly passwordGenerator: PasswordGenerator;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authorization = context
      .switchToHttp()
      .getRequest<Request>()
      .header('authorization');
    if (!authorization) return false;

    return true;
  }
}

export type AuthorizedHeader = Readonly<{ accountId: string }>;

export const Auth = () =>
  applyDecorators(
    UseGuards(AuthGuard),
    ApiBasicAuth(),
    ApiForbiddenResponse({
      description: 'Authorization header validation is failed',
    }),
  );
