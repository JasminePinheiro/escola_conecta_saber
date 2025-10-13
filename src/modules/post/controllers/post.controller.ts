import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostService } from '../services/post.service.js';
import {
  CreatePostDto,
  UpdatePostDto,
  SearchPostsDto,
  PaginationDto,
  PostResponseDto,
  PaginatedResponseDto,
} from '../dto/post.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Role } from '../../../common/guards/roles.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { UserResponseDto } from '../../auth/dto/auth.dto.js';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar novo post (professor ou admin)' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post criado com sucesso',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PostResponseDto> {
    createPostDto.author = user.name;
    return this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar posts publicados (rota pública)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de posts publicados' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.findAll(paginationDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar TODOS os posts incluindo rascunhos (professor ou admin)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista completa de posts' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async findAllForTeachers(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.findAllForTeachers(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar posts por palavra-chave (rota pública)' })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    example: 'programação',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  async search(
    @Query() searchPostsDto: SearchPostsDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.search(searchPostsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar post por ID (rota pública)' })
  @ApiParam({ name: 'id', type: String, example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Post encontrado',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async findOne(@Param() params: { id: string }): Promise<PostResponseDto> {
    return this.postService.findOne(params.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Editar post (professor ou admin)' })
  @ApiParam({ name: 'id', type: String, example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post atualizado com sucesso',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async update(
    @Param() params: { id: string },
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PostResponseDto> {
    updatePostDto.author = user.name;
    return this.postService.update(params.id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deletar post (professor ou admin)' })
  @ApiParam({ name: 'id', type: String, example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 204, description: 'Post deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async remove(@Param() params: { id: string }): Promise<void> {
    return this.postService.remove(params.id);
  }
}
