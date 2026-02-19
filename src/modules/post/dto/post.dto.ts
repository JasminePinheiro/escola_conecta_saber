import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'Introdução à Programação',
    description: 'Título do post',
    minLength: 1,
    maxLength: 200,
  })
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MinLength(1, { message: 'O título não pode ser vazio' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiProperty({
    example: 'Neste post vamos aprender os conceitos básicos de programação...',
    description: 'Conteúdo do post',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString({ message: 'O conteúdo deve ser uma string' })
  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  @MinLength(1, { message: 'O conteúdo não pode ser vazio' })
  @MaxLength(5000, { message: 'O conteúdo deve ter no máximo 5000 caracteres' })
  content: string;

  @ApiPropertyOptional({
    example: 'Professor Silva',
    description: 'Nome do autor (preenchido automaticamente)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'O autor deve ser uma string' })
  @IsNotEmpty({ message: 'O autor não pode ser vazio' })
  @MinLength(1)
  @MaxLength(100)
  author?: string;

  @ApiProperty({
    example: 'Matemática',
    description: 'Disciplina do post',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'A categoria deve ser uma string' })
  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  @MinLength(1, { message: 'A categoria não pode ser vazia' })
  @MaxLength(100, { message: 'A categoria deve ter no máximo 100 caracteres' })
  category: string;

  @ApiPropertyOptional({
    example: ['educação', 'programação', 'iniciantes'],
    description: 'Tags do post',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Se o post está visível publicamente',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;

  @ApiPropertyOptional({
    example: 'published',
    enum: ['draft', 'published', 'scheduled', 'private'],
    description: 'Estado do post',
    default: 'draft',
  })
  @IsOptional()
  @IsString({ message: 'O status deve ser uma string' })
  status?: 'draft' | 'published' | 'scheduled' | 'private';

  @ApiPropertyOptional({
    example: '2024-12-25T10:00:00Z',
    description: 'Data de publicação agendada',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  scheduledAt?: Date;
}

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'Título Atualizado',
    description: 'Novo título do post',
  })
  @IsOptional()
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título não pode ser vazio' })
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'Conteúdo atualizado do post...',
    description: 'Novo conteúdo do post',
  })
  @IsOptional()
  @IsString({ message: 'O conteúdo deve ser uma string' })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    example: 'Professor Silva',
    description: 'Nome do autor',
  })
  @IsOptional()
  @IsString({ message: 'O autor deve ser uma string' })
  @IsNotEmpty({ message: 'O autor não pode ser vazio' })
  @MinLength(1)
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    example: 'História',
    description: 'Nova disciplina do post',
  })
  @IsOptional()
  @IsString({ message: 'A categoria deve ser uma string' })
  @IsNotEmpty({ message: 'A categoria não pode ser vazia' })
  @MinLength(1)
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    example: ['educação', 'tecnologia'],
    description: 'Novas tags do post',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Se o post está visível publicamente',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  published?: boolean;

  @ApiPropertyOptional({
    example: 'published',
    enum: ['draft', 'published', 'scheduled', 'private'],
    description: 'Estado do post',
  })
  @IsOptional()
  @IsString({ message: 'O status deve ser uma string' })
  status?: 'draft' | 'published' | 'scheduled' | 'private';

  @ApiPropertyOptional({
    example: '2024-12-25T10:00:00Z',
    description: 'Data de publicação agendada',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  scheduledAt?: Date;
}

export class CreateCommentDto {
  @ApiProperty({
    example: 'Muito interessante este post!',
    description: 'Conteúdo do comentário',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'O conteúdo deve ser uma string' })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({
    example: 'Aluno João',
    description: 'Nome do autor do comentário',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'O autor deve ser uma string' })
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    example: 'user_123',
    description: 'ID do autor do comentário',
  })
  @IsOptional()
  @IsString({ message: 'O ID do autor deve ser uma string' })
  authorId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Conteúdo atualizado!',
    description: 'Novo conteúdo do comentário',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'O conteúdo deve ser uma string' })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}

export class SearchPostsDto {
  @ApiProperty({
    example: 'programação',
    description: 'Termo de busca',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'A busca deve ser uma string' })
  @IsNotEmpty({ message: 'O termo de busca não pode ser vazio' })
  @MinLength(1)
  @MaxLength(100)
  query: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número da página',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número da página',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Itens por página',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PostResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Introdução à Programação' })
  title: string;

  @ApiProperty({ example: 'Neste post vamos aprender...' })
  content: string;

  @ApiProperty({ example: 'Professor Silva' })
  author: string;

  @ApiProperty({ example: 'Matemática' })
  category: string;

  @ApiProperty({ example: ['educação', 'programação'] })
  tags: string[];

  @ApiProperty({ example: true })
  published: boolean;

  @ApiProperty({
    example: 'published',
    enum: ['draft', 'published', 'scheduled', 'private'],
  })
  status: 'draft' | 'published' | 'scheduled' | 'private';

  @ApiPropertyOptional({ example: '2024-12-25T10:00:00Z' })
  scheduledAt?: Date;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({
    isArray: true,
    example: [
      {
        author: 'João',
        content: 'Boa explicação!',
        createdAt: '2024-01-16T10:30:00Z',
      },
    ],
  })
  comments?: { id?: string; author: string; authorId: string; content: string; createdAt: Date }[];
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
