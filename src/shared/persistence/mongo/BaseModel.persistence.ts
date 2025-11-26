import { Prop, Schema } from '@nestjs/mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    transform: (_, ret: any) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: (_, ret: any) => {
      delete ret.__v;
      return ret;
    },
  },
})
export abstract class BaseModel {
  _id: string;

  @Prop({
    type: Date,
  })
  createdAt: Date;

  @Prop({
    type: Date,
  })
  updatedAt: Date;

  @Prop({
    type: String,
  })
  createdBy: string | null;

  @Prop({
    type: String,
  })
  updatedBy: string | null;

  @Prop({
    type: Date,
  })
  deletedAt: Date | null;
}
