import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthRepository } from '../../domain/repositories/Auth.repository';
import { AuthEntity } from '../../domain/entities/Auth.entity';
import { AuthModel, AuthDocument } from '../models/Auth.model';
import { AuthMapper } from '../mappers/Auth.mapper';

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @InjectModel(AuthModel.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  async findByEmail(email: string): Promise<AuthEntity | null> {
    const auth = await this.authModel.findOne({ email }).exec();
    if (!auth) {
      return null;
    }
    return AuthMapper.toDomain(auth);
  }

  async findById(id: string): Promise<AuthEntity | null> {
    const auth = await this.authModel.findById(id).exec();
    if (!auth) {
      return null;
    }
    return AuthMapper.toDomain(auth);
  }

  async save(authEntity: AuthEntity): Promise<AuthEntity> {
    const data = AuthMapper.toPersistence(authEntity);
    const created = new this.authModel(data);
    const saved = await created.save();
    return AuthMapper.toDomain(saved);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.authModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }
}
