import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from '../services/auth.service.js';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateProfileDto,
  ChangePasswordDto,
  AuthResponseDto,
  UserResponseDto,
} from '../dto/auth.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard, Role } from '../../../common/guards/roles.guard.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import {
  ChangePasswordSchema,
  LoginUserSchema,
  RegisterUserSchema,
  UpdateProfileSchema,
} from '../schemas/user.schema.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegisterUserSchema))
  @ApiOperation({ summary: 'Cadastrar novo usuário (aluno ou professor)' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginUserSchema))
  @ApiOperation({ summary: 'Login de usuário' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(loginUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar perfil do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getProfile(
    @CurrentUser() user: UserResponseDto,
  ): Promise<UserResponseDto> {
    return user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async updateProfile(
    @CurrentUser() user: UserResponseDto,
    @Body(new ZodValidationPipe(UpdateProfileSchema))
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 401, description: 'Senha atual incorreta' })
  async changePassword(
    @CurrentUser() user: UserResponseDto,
    @Body(new ZodValidationPipe(ChangePasswordSchema))
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Get('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os professores (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de professores',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async getTeachers(): Promise<UserResponseDto[]> {
    return this.authService.findUsersByRole('teacher');
  }

  @Get('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os alunos (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alunos',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async getStudents(): Promise<UserResponseDto[]> {
    return this.authService.findUsersByRole('student');
  }
}
