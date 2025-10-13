import { PostDocument } from '../models/post.model.js';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto.js';

export interface IPostRepository {
  create(postData: CreatePostDto): Promise<PostDocument>;
  findById(id: string): Promise<PostDocument | null>;
  findAll(
    skip: number,
    limit: number,
    publishedOnly?: boolean,
  ): Promise<PostDocument[]>;
  countDocuments(publishedOnly?: boolean): Promise<number>;
  update(id: string, postData: UpdatePostDto): Promise<PostDocument | null>;
  delete(id: string): Promise<PostDocument | null>;
  search(query: string, skip: number, limit: number): Promise<PostDocument[]>;
  countSearchResults(query: string): Promise<number>;
}
