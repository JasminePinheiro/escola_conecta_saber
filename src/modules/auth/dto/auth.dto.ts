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
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha (mínimo 6 caracteres)',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiPropertyOptional({
    example: 'student',
    enum: ['student', 'teacher'],
    description: 'Papel do usuário (admin não pode ser criado aqui)',
    default: 'student',
  })
  @IsOptional()
  @IsEnum(['student', 'teacher'])
  role?: 'student' | 'teacher';
}

export class LoginUserDto {
  @ApiProperty({
    example: 'usuario@escola.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
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
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'novoemail@escola.com',
    description: 'Novo email do usuário',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'senhaAtual123',
    description: 'Senha atual do usuário',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'novaSenha456',
    description: 'Nova senha (mínimo 6 caracteres)',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
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
