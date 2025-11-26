import { Observable } from 'rxjs';

export interface GetUserByEmailRequest {
  email: string;
}

export interface GetUserByEmailResponse {
  found: boolean;
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}

export interface UserServiceClient {
  getUserByEmail(request: GetUserByEmailRequest): Observable<GetUserByEmailResponse>;
  createUser(request: CreateUserRequest): Observable<CreateUserResponse>;
}
