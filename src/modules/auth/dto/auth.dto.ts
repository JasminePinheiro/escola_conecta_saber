import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'usuario@escola.com',
    description: 'Email do usuário',
    maxLength: 100,
  })
  @IsEmail({}, { message: 'O e-mail deve ser um endereço de e-mail válido' })
  @MaxLength(100, { message: 'O e-mail deve ter no máximo 100 caracteres' })
  email: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha (mínimo 6 caracteres)',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @MaxLength(50, { message: 'A senha deve ter no máximo 50 caracteres' })
  password: string;

  @ApiPropertyOptional({
    example: 'student',
    enum: ['student', 'teacher'],
    description: 'Papel do usuário (admin não pode ser criado aqui)',
    default: 'student',
  })
  @IsOptional()
  @IsEnum(['student', 'teacher'], { message: 'O papel deve ser estudante ou professor' })
  role?: 'student' | 'teacher';
}

export class LoginUserDto {
  @ApiProperty({
    example: 'usuario@escola.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'O e-mail deve ser um endereço de e-mail válido' })
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'João Silva',
    description: 'Novo nome do usuário',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    example: 'novoemail@escola.com',
    description: 'Novo email do usuário',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O e-mail deve ser um endereço de e-mail válido' })
  @MaxLength(100, { message: 'O e-mail deve ter no máximo 100 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    example: 'https://escola.com/avatar.jpg',
    description: 'URL da imagem de perfil',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'senhaAtual123',
    description: 'Senha atual do usuário',
  })
  @IsString({ message: 'A senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'A senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({
    example: 'novaSenha456',
    description: 'Nova senha (mínimo 6 caracteres)',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: 'A nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
  @MaxLength(50, { message: 'A nova senha deve ter no máximo 50 caracteres' })
  newPassword: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'usuario@escola.com' })
  email: string;

  @ApiProperty({ example: 'João Silva' })
  name: string;

  @ApiProperty({ example: 'student', enum: ['student', 'teacher', 'admin'] })
  role: 'student' | 'teacher' | 'admin';

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'https://escola.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  lastLogin?: Date;

  @ApiProperty({ example: '2024-01-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}
