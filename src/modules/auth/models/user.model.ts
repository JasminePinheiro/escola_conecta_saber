import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, maxlength: 100 })
  email: string;

  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  })
  role: 'student' | 'teacher' | 'admin';

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
