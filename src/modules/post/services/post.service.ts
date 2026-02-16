import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository.js';
import {
  CreatePostDto,
  UpdatePostDto,
  SearchPostsDto,
  PaginationDto,
  PostResponseDto,
  PaginatedResponseDto,
} from '../dto/post.dto.js';
import { PostDocument } from '../models/post.model.js';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) { }

  async create(createPostDto: CreatePostDto): Promise<PostResponseDto> {
    try {
      if (!createPostDto.author) {
        throw new BadRequestException('Autor é obrigatório');
      }

      const savedPost = await this.postRepository.create(createPostDto);
      return this.mapToResponseDto(savedPost);
    } catch (error) {
      throw new BadRequestException('Erro ao criar post: ' + error.message);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    currentAuthor?: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [posts, total] = await Promise.all([
        this.postRepository.findAll(skip, limit, true, currentAuthor),
        this.postRepository.countDocuments(true, currentAuthor),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: posts.map((post) => this.mapToResponseDto(post)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException('Erro ao buscar posts: ' + error.message);
    }
  }

  async findAllForTeachers(
    paginationDto: PaginationDto,
    currentAuthor?: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [posts, total] = await Promise.all([
        this.postRepository.findAll(skip, limit, false, currentAuthor),
        this.postRepository.countDocuments(false, currentAuthor),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: posts.map((post) => this.mapToResponseDto(post)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException('Erro ao buscar posts: ' + error.message);
    }
  }

  async findOne(
    id: string,
    currentAuthor?: string,
    role?: string,
  ): Promise<PostResponseDto> {
    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }

      if (post.status === 'published') return this.mapToResponseDto(post);

      if (post.status === 'draft') {
        if (role === 'teacher' || role === 'admin') {
          return this.mapToResponseDto(post);
        }
      }

      if (post.status === 'private') {
        if (post.author === currentAuthor) {
          return this.mapToResponseDto(post);
        }
      }

      throw new NotFoundException(`Post com ID ${id} não encontrado`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao buscar post: ' + error.message);
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    try {
      const updatedPost = await this.postRepository.update(id, updatePostDto);

      if (!updatedPost) {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }

      return this.mapToResponseDto(updatedPost);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar post: ' + error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.postRepository.delete(id);
      if (!result) {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao deletar post: ' + error.message);
    }
  }

  async search(
    searchPostsDto: SearchPostsDto,
    currentAuthor?: string,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const { query, page = 1, limit = 10 } = searchPostsDto;
    const skip = (page - 1) * limit;

    try {
      const [posts, total] = await Promise.all([
        this.postRepository.search(query, skip, limit, currentAuthor),
        this.postRepository.countSearchResults(query, currentAuthor),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: posts.map((post) => this.mapToResponseDto(post)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException('Erro ao buscar posts: ' + error.message);
    }
  }

  private mapToResponseDto(post: PostDocument): PostResponseDto {
    return {
      id: (post._id as any).toString(),
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags,
      published: post.published,
      status: post.status,
      scheduledAt: post.scheduledAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
