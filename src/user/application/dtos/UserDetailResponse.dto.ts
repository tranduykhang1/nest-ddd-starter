import { HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ResponseBuilder,
} from '../../../shared/presentation/dto/Response';
import { UserEntity } from '../../domain/entities/User.entity';

export class UserDetailResponse {
  constructor(user: UserEntity) {
    Object.assign(this, user);
  }
  toResponse(): ApiResponse<UserDetailResponse> {
    return ResponseBuilder.success<UserDetailResponse>(this, HttpStatus.OK);
  }
}
