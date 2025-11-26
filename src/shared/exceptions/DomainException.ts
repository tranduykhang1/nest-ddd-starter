import { ExceptionBase, ExceptionDetails } from './ExceptionBase';

export const ExceptionCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_NAME: 'INVALID_NAME',

  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',

  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',

  INVALID_OPERATION: 'INVALID_OPERATION',
  AGGREGATE_VERSION_CONFLICT: 'AGGREGATE_VERSION_CONFLICT',
} as const;

export type ExceptionCodeType =
  (typeof ExceptionCode)[keyof typeof ExceptionCode];

export class DomainException extends ExceptionBase {
  readonly code: string;

  constructor(
    message: string,
    code: ExceptionCodeType | string = 'DOMAIN_ERROR',
    details?: ExceptionDetails,
  ) {
    super(message, details);
    this.code = code;
  }
}

export class NotFoundException extends ExceptionBase {
  readonly code: string;

  constructor(
    message: string = 'Resource not found',
    code: ExceptionCodeType | string = ExceptionCode.ENTITY_NOT_FOUND,
    details?: ExceptionDetails,
  ) {
    super(message, details);
    this.code = code;
  }
}

export class ConflictException extends ExceptionBase {
  readonly code: string;

  constructor(
    message: string = 'Resource already exists',
    code: ExceptionCodeType | string = ExceptionCode.ENTITY_ALREADY_EXISTS,
    details?: ExceptionDetails,
  ) {
    super(message, details);
    this.code = code;
  }
}

export class UnauthorizedException extends ExceptionBase {
  readonly code: string;

  constructor(
    message: string = 'Unauthorized',
    code: ExceptionCodeType | string = ExceptionCode.UNAUTHORIZED,
    details?: ExceptionDetails,
  ) {
    super(message, details);
    this.code = code;
  }
}

export class BadRequestException extends ExceptionBase {
  readonly code: string;

  constructor(
    message: string = 'Bad request',
    code: ExceptionCodeType | string = ExceptionCode.VALIDATION_ERROR,
    details?: ExceptionDetails,
  ) {
    super(message, details);
    this.code = code;
  }
}
