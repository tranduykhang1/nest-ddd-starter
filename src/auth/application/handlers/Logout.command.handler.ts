import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutCommand } from '../commands/Logout.command';
import { AuthRepository } from '../../domain/repositories/Auth.repository';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFound.exception';
import { AUTH_REPOSITORY } from '../InjectionToken';

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler
  implements ICommandHandler<LogoutCommand, void>
{
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const auth = await this.authRepository.findById(command.userId);
    if (!auth) {
      throw new UserNotFoundException();
    }

    auth.logout();
    await this.authRepository.updateRefreshToken(auth.id, null);
  }
}
