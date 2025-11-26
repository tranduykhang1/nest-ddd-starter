import { BaseEntityDomain } from '../../../shared/domain/BaseEntity.domain';

export class AuthEntity extends BaseEntityDomain {
  email: string;
  password: string;
  refreshToken: string | null;
  lastLoginAt: Date | null;

  static create(props: { email: string; password: string }): AuthEntity {
    const auth = new AuthEntity();
    auth.email = props.email;
    auth.password = props.password;
    auth.refreshToken = null;
    auth.lastLoginAt = null;
    return auth;
  }

  updateRefreshToken(token: string | null): void {
    this.refreshToken = token;
  }

  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  logout(): void {
    this.refreshToken = null;
  }
}
