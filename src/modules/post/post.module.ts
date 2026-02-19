import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './controllers/post.controller.js';
import { PostService } from './services/post.service.js';
import { PostRepository } from './repositories/post.repository.js';
import { Post, PostSchema } from './models/post.model.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    AuthModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostService],
})
export class PostModule { }
