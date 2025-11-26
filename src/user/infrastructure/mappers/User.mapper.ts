import { IMapper } from '../../../shared/domain/mappers/Mapper';
import { UserEntity } from '../../domain/entities/User.entity';
import { UserModel } from '../models/User.model';

export class UserMapper
  implements IMapper<UserEntity, UserModel | Record<string, unknown>>
{
  toDomain(raw: UserModel | Record<string, unknown>): UserEntity {
    const model = raw as UserModel;
    return UserEntity.fromPersistence({
      id:
        model._id?.toString() ||
        ((raw as Record<string, unknown>).id as string),
      email: model.email,
      name: model.name,
      createdAt: model.createdAt || new Date(),
      updatedAt: model.updatedAt || new Date(),
      deletedAt: model.deletedAt || null,
    });
  }

  toPersistence(entity: UserEntity): Record<string, unknown> {
    return entity.toPersistence();
  }
}
