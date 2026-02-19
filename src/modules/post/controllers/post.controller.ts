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
  CreateCommentDto,
  UpdateCommentDto,
} from '../dto/post.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Role } from '../../../common/guards/roles.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { UserResponseDto } from '../../auth/dto/auth.dto.js';
import { OptionalJwtAuthGuard } from '../../../common/guards/optional-jwt-auth.guard.js';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

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
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Listar posts públicos e rascunhos (rota com auth opcional)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de posts (Público/Rascunho para todos, Privado para o autor)' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user?: UserResponseDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.findAll(paginationDto, user?.name);
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
    @CurrentUser() user: UserResponseDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.findAllForTeachers(paginationDto, user.name);
  }

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Buscar posts por palavra-chave (rota com auth opcional)' })
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
    @CurrentUser() user?: UserResponseDto,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return this.postService.search(searchPostsDto, user?.name);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Buscar post por ID (com auth opcional)' })
  @ApiParam({ name: 'id', type: String, example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 200,
    description: 'Post encontrado',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado ou acesso negado' })
  async findOne(
    @Param() params: { id: string },
    @CurrentUser() user?: UserResponseDto,
  ): Promise<PostResponseDto> {
    return this.postService.findOne(params.id, user?.name, user?.role);
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

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Adicionar comentário a um post' })
  @ApiParam({ name: 'id', type: String, example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comentário adicionado com sucesso',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PostResponseDto> {
    createCommentDto.author = user.name;
    createCommentDto.authorId = user.id;
    return this.postService.addComment(id, createCommentDto);
  }

  @Patch(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Editar comentário' })
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PostResponseDto> {
    return this.postService.updateComment(id, commentId, updateCommentDto, user);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remover comentário' })
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PostResponseDto> {
    return this.postService.deleteComment(id, commentId, user);
  }
}
