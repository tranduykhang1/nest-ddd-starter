export interface CreateUserPayload {
  email: string;
  name: string;
}

export class UserCreateCommand {
  constructor(readonly payload: CreateUserPayload) {}
}
