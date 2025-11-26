import { IsString } from 'class-validator';

export class UserRequestDto {
  @IsString()
  readonly id: string;
}
