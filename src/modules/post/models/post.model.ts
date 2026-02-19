import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 5000 })
  content: string;

  @Prop({ required: true, maxlength: 100 })
  author: string;

  @Prop({ required: true, maxlength: 100 })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  published: boolean;

  @Prop({
    type: String,
    enum: ['draft', 'published', 'scheduled', 'private'],
    default: 'published',
  })
  status: 'draft' | 'published' | 'scheduled' | 'private';

  @Prop()
  scheduledAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({
    type: [
      {
        author: { type: String, required: true },
        authorId: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: { id?: string; author: string; authorId: string; content: string; createdAt: Date }[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ author: 1 });
PostSchema.index({ published: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ scheduledAt: 1 });
PostSchema.index({ tags: 1 });
