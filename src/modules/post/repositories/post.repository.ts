import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../models/post.model.js';
import { IPostRepository } from './post.repository.interface.js';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto.js';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) { }

  async create(postData: CreatePostDto): Promise<PostDocument> {
    const post = new this.postModel(postData);
    return post.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id).exec();
  }

  async findAll(
    skip: number,
    limit: number,
    publishedOnly: boolean = false,
    currentAuthor?: string,
  ): Promise<PostDocument[]> {
    const query = publishedOnly
      ? { status: 'published' }
      : {
        $or: [
          { status: { $in: ['published', 'draft'] } },
          { status: 'private', author: currentAuthor },
        ],
      };

    return this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countDocuments(
    publishedOnly: boolean = false,
    currentAuthor?: string,
  ): Promise<number> {
    const query = publishedOnly
      ? { status: 'published' }
      : {
        $or: [
          { status: { $in: ['published', 'draft'] } },
          { status: 'private', author: currentAuthor },
        ],
      };
    return this.postModel.countDocuments(query);
  }

  async update(
    id: string,
    postData: UpdatePostDto,
  ): Promise<PostDocument | null> {
    return this.postModel
      .findByIdAndUpdate(id, postData, { new: true, runValidators: true })
      .exec();
  }

  async delete(id: string): Promise<PostDocument | null> {
    return this.postModel.findByIdAndDelete(id).exec();
  }

  async search(
    query: string,
    skip: number,
    limit: number,
    currentAuthor?: string,
  ): Promise<PostDocument[]> {
    const searchQuery = {
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ],
        },
      ],
    };

    return this.postModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countSearchResults(
    query: string,
    currentAuthor?: string,
  ): Promise<number> {
    const searchQuery = {
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ],
        },
      ],
    };

    return this.postModel.countDocuments(searchQuery);
  }
}
