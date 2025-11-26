import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../shared/persistence/mongo/BaseRepositoryImpl.persistence';
import { UserEntity } from '../../domain/entities/User.entity';
import { UserRepository } from '../../domain/repositories/User.repository';
import { UserMapper } from '../mappers/User.mapper';
import { UserModel } from '../models/User.model';

@Injectable()
export class UserRepositoryImpl
  extends BaseMongoRepository<UserEntity, UserModel>
  implements UserRepository
{
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserModel>,
  ) {
    super(userModel, new UserMapper());
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOneByCondition({ email });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email }).exec();
    return count > 0;
  }
}
