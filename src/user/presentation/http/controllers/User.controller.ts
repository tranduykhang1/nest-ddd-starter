import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserGetDetailQuery } from '../../../application/queries/UserGetDetail.query';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserDetail(@Param('id') id: string) {
    return this.queryBus.execute(new UserGetDetailQuery(id));
  }
}
