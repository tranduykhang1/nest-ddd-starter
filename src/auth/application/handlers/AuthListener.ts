import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AuthListener {
  @EventPattern('user_created')
  handleUserCreated(data: any) {
    console.log('User created:', data);
  }
}
