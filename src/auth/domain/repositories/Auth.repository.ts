import { AuthEntity } from '../entities/Auth.entity';

export interface AuthRepository {
  findByEmail(email: string): Promise<AuthEntity | null>;
  findById(id: string): Promise<AuthEntity | null>;
  save(auth: AuthEntity): Promise<AuthEntity>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
}
