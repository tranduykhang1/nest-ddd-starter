import { AuthEntity } from '../../domain/entities/Auth.entity';
import { AuthModel } from '../models/Auth.model';

export class AuthMapper {
  static toDomain(model: AuthModel): AuthEntity {
    const entity = new AuthEntity();
    entity.id = model._id.toString();
    entity.email = model.email;
    entity.password = model.password;
    entity.refreshToken = model.refreshToken;
    entity.lastLoginAt = model.lastLoginAt;
    return entity;
  }

  static toPersistence(entity: AuthEntity): Partial<AuthModel> {
    return {
      email: entity.email,
      password: entity.password,
      refreshToken: entity.refreshToken,
      lastLoginAt: entity.lastLoginAt,
    };
  }
}
