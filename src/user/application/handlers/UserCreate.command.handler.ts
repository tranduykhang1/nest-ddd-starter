import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/User.repository';
import { UserCreateCommand } from '../commands/UserCreate.command';
import { UserEntity } from '../../domain/entities/User.entity';
import {
  DomainException,
  ExceptionCode,
} from '../../../shared/exceptions/DomainException';
import { USER_REPOSITORY } from '../InjectionToken';

@CommandHandler(UserCreateCommand)
export class UserCreateCommandHandler
  implements ICommandHandler<UserCreateCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(command: UserCreateCommand): Promise<UserEntity> {
    const { email, name } = command.payload;

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new DomainException(
        'Email already exists',
        ExceptionCode.USER_ALREADY_EXISTS,
        { email },
      );
    }

    const user = UserEntity.create({ email, name });

    const savedUser = await this.userRepo.save(user);

    return savedUser;
  }
}
