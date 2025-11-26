import { IBaseRepository } from '../../../shared/domain/repositories/BaseRepository';
import { UserEntity } from '../entities/User.entity';

export interface UserRepository extends IBaseRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;

  existsByEmail(email: string): Promise<boolean>;
}
