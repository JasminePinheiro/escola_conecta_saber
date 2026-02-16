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
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Neste post vamos aprender os conceitos básicos de programação...',
    description: 'Conteúdo do post',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({
    example: 'Professor Silva',
    description: 'Nome do autor (preenchido automaticamente)',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  author?: string;

  @ApiProperty({
    example: 'Matemática',
    description: 'Disciplina do post',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
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
  @IsString()
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
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    example: 'Conteúdo atualizado do post...',
    description: 'Novo conteúdo do post',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    example: 'Professor Silva',
    description: 'Nome do autor',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  author?: string;

  @ApiPropertyOptional({
    example: 'História',
    description: 'Nova disciplina do post',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
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
  @IsString()
  status?: 'draft' | 'published' | 'scheduled' | 'private';

  @ApiPropertyOptional({
    example: '2024-12-25T10:00:00Z',
    description: 'Data de publicação agendada',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  scheduledAt?: Date;
}

export class SearchPostsDto {
  @ApiProperty({
    example: 'programação',
    description: 'Termo de busca',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
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
