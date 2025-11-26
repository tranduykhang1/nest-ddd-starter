import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ExceptionCode,
} from './DomainException';

export class UserNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super(
      identifier ? `User with ${identifier} not found` : 'User not found',
      ExceptionCode.USER_NOT_FOUND,
      identifier ? { identifier } : undefined,
    );
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor(
    email?: string,
    code: string = ExceptionCode.USER_ALREADY_EXISTS,
  ) {
    super(
      email ? `User with email ${email} already exists` : 'User already exists',
      code,
      email ? { email } : undefined,
    );
  }
}

export class InvalidEmailException extends BadRequestException {
  constructor(email?: string, code: string = ExceptionCode.INVALID_EMAIL) {
    super(
      email ? `Invalid email format: ${email}` : 'Invalid email format',
      code,
      email ? { email } : undefined,
    );
  }
}

export class InvalidPasswordException extends BadRequestException {
  constructor(
    message: string = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
    code: string = ExceptionCode.INVALID_PASSWORD,
  ) {
    super(message, code);
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor(code: string = ExceptionCode.INVALID_CREDENTIALS) {
    super('Invalid email or password', code);
  }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor(code = ExceptionCode.TOKEN_EXPIRED) {
    super('Token has expired', code);
  }
}

export class InvalidNameException extends BadRequestException {
  constructor(name?: string) {
    super(
      'Name must be at least 2 characters',
      ExceptionCode.INVALID_NAME,
      name ? { name } : undefined,
    );
  }
}
