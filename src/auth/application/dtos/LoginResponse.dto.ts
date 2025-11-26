import { HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ResponseBuilder,
} from '../../../shared/presentation/dto/Response';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
export class LoginResponse {
  constructor(data: LoginResult) {
    Object.assign(this, data);
  }
  toResponse(): ApiResponse<LoginResponse> {
    return ResponseBuilder.success<LoginResponse>(this, HttpStatus.OK);
  }
}
