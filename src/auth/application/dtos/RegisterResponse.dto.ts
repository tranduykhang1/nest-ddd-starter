import { HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ResponseBuilder,
} from '../../../shared/presentation/dto/Response';
import { LoginResult } from './LoginResponse.dto';

export class RegisterResponse {
  constructor(data: LoginResult) {
    Object.assign(this, data);
  }
  toResponse(): ApiResponse<RegisterResponse> {
    return ResponseBuilder.success<RegisterResponse>(this, HttpStatus.OK);
  }
}
