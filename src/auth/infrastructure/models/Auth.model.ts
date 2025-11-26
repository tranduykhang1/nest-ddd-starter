import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseModel } from '../../../shared/persistence/mongo/BaseModel.persistence';

@Schema({ collection: 'auth' })
export class AuthModel extends BaseModel {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: null })
  refreshToken: string | null;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;
}

export type AuthDocument = AuthModel & Document;
export const AuthSchema = SchemaFactory.createForClass(AuthModel);
