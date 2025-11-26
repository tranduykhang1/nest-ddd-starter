import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ApiResponse } from '../../../shared/presentation/dto/Response';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFound.exception';
import { UserRepository } from '../../domain/repositories/User.repository';
import { UserDetailResponse } from '../dtos/UserDetailResponse.dto';
import { USER_REPOSITORY } from '../InjectionToken';
import { UserGetDetailQuery } from '../queries/UserGetDetail.query';

@QueryHandler(UserGetDetailQuery)
export class UserGetDetailHandler
  implements IQueryHandler<UserGetDetailQuery, ApiResponse<UserDetailResponse>>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(query: UserGetDetailQuery): Promise<ApiResponse<UserDetailResponse>> {
    const user = await this.userRepo.findById(query.id);

    if (!user) {
      throw new UserNotFoundException();
    }

    const res = new UserDetailResponse(user).toResponse();
    return res;
  }
}
