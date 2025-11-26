import { EmailVO } from '../../../shared/domain/value-objects/Email.vo';
import { InvalidNameException } from '../../../shared/exceptions/CommonExceptions';
import {
  DomainException,
  ExceptionCode,
} from '../../../shared/exceptions/DomainException';

export interface CreateUserProps {
  email: string;
  name: string;
}

export interface UserProps {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class UserEntity {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null = null;

  constructor() {}

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Factory method to create a new user
   */
  static create(props: CreateUserProps): UserEntity {
    const user = new UserEntity();

    if (!props.name || props.name.trim().length < 2) {
      throw new InvalidNameException(props.name);
    }

    const emailVO = EmailVO.create(props.email);

    user.email = emailVO.value;
    user.name = props.name.trim();
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return user;
  }

  static fromPersistence(props: UserProps): UserEntity {
    const user = new UserEntity();
    user.id = props.id;
    user.email = props.email;
    user.name = props.name;
    user.createdAt = props.createdAt;
    user.updatedAt = props.updatedAt;
    user.deletedAt = props.deletedAt ?? null;
    return user;
  }

  updateEmail(newEmail: string): void {
    this.ensureNotDeleted();

    const emailVO = EmailVO.create(newEmail);

    if (this.email === emailVO.value) {
      return;
    }

    this.email = emailVO.value;
    this.updatedAt = new Date();
  }

  delete(): void {
    this.ensureNotDeleted();

    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  private ensureNotDeleted(): void {
    if (this.isDeleted) {
      throw new DomainException(
        'Cannot modify deleted user',
        ExceptionCode.ENTITY_NOT_FOUND,
        { userId: this.id },
      );
    }
  }

  toPersistence(): Record<string, unknown> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
