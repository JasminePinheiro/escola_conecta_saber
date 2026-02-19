import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository.js';
import {
  CreatePostDto,
  UpdatePostDto,
  SearchPostsDto,
  PaginationDto,
  PostResponseDto,
  PaginatedResponseDto,
  CreateCommentDto,
  UpdateCommentDto,
} from '../dto/post.dto.js';
import { UserResponseDto } from '../../auth/dto/auth.dto.js';
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

  async addComment(
    id: string,
    createCommentDto: CreateCommentDto,
  ): Promise<PostResponseDto> {
    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }

      if (!post.comments) {
        post.comments = [];
      }

      post.comments.push({
        author: createCommentDto.author || 'Anônimo',
        authorId: createCommentDto.authorId || '',
        content: createCommentDto.content,
        createdAt: new Date(),
      });

      const updatedPost = await this.postRepository.update(id, {
        comments: post.comments,
      } as any);

      if (!updatedPost) {
        throw new NotFoundException(`Post com ID ${id} não encontrado após atualização`);
      }

      return this.mapToResponseDto(updatedPost);
    } catch (error) {
      console.error('Erro detalhado ao adicionar comentário:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao adicionar comentário: ' + error.message);
    }
  }

  async updateComment(
    id: string,
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    user: UserResponseDto,
  ): Promise<PostResponseDto> {
    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }

      const commentIndex = post.comments.findIndex(
        (c) => (c as any)._id?.toString() === commentId,
      );

      if (commentIndex === -1) {
        throw new NotFoundException(`Comentário com ID ${commentId} não encontrado`);
      }

      const comment = post.comments[commentIndex];

      // Apenas o autor ou admin pode editar
      if (comment.authorId !== user.id && user.role !== 'admin') {
        throw new ForbiddenException('Sem permissão para editar este comentário');
      }

      comment.content = updateCommentDto.content;

      const updatedPost = await this.postRepository.update(id, {
        comments: post.comments,
      } as any);

      return this.mapToResponseDto(updatedPost!);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar comentário: ' + error.message);
    }
  }

  async deleteComment(
    id: string,
    commentId: string,
    user: UserResponseDto,
  ): Promise<PostResponseDto> {
    try {
      const post = await this.postRepository.findById(id);
      if (!post) {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }

      const commentIndex = post.comments.findIndex(
        (c) => (c as any)._id?.toString() === commentId,
      );

      if (commentIndex === -1) {
        throw new NotFoundException(`Comentário com ID ${commentId} não encontrado`);
      }

      const comment = post.comments[commentIndex];

      // Autor, Professor ou Admin pode deletar
      if (
        comment.authorId !== user.id &&
        user.role !== 'admin' &&
        user.role !== 'teacher'
      ) {
        throw new ForbiddenException('Sem permissão para remover este comentário');
      }

      post.comments.splice(commentIndex, 1);

      const updatedPost = await this.postRepository.update(id, {
        comments: post.comments,
      } as any);

      return this.mapToResponseDto(updatedPost!);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Erro ao remover comentário: ' + error.message);
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
      category: post.category,
      tags: post.tags,
      published: post.published,
      status: post.status,
      scheduledAt: post.scheduledAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      comments:
        post.comments?.map((c) => ({
          id: (c as any)._id?.toString(),
          author: c.author,
          authorId: c.authorId,
          content: c.content,
          createdAt: c.createdAt,
        })) || [],
    };
  }
}
