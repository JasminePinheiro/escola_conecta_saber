import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { UserRepository } from '../repositories/user.repository.js';
import {
  RegisterUserDto,
  LoginUserDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UserResponseDto,
  AuthResponseDto,
} from '../dto/auth.dto.js';
import { UserDocument } from '../models/user.model.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    const { email, name, password, role = 'student' } = registerUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const savedUser = await this.userRepository.create({
        email,
        name,
        password: hashedPassword,
        role,
      });

      const tokens = await this.generateTokens(savedUser);

      return {
        user: this.mapToResponseDto(savedUser),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new BadRequestException('Erro ao criar usuário: ' + error.message);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { email, password } = loginUserDto;

    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      await this.userRepository.updateLastLogin((user._id as any).toString());

      const tokens = await this.generateTokens(user);

      return {
        user: this.mapToResponseDto(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao fazer login: ' + error.message);
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.isActive) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return this.mapToResponseDto(user);
    } catch (error) {
      return null;
    }
  }

  async findUserById(id: string): Promise<UserResponseDto> {
    try {
      if (!id || !Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de usuário inválido');
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return this.mapToResponseDto(user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao buscar usuário: ' + error.message);
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(
          updateProfileDto.email,
        );
        if (existingUser) {
          throw new ConflictException('Email já está em uso');
        }
      }

      const updatedUser = await this.userRepository.update(
        userId,
        updateProfileDto,
      );
      if (!updatedUser) {
        throw new NotFoundException('Erro ao atualizar usuário');
      }

      return this.mapToResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Erro ao atualizar perfil: ' + error.message,
      );
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Senha atual incorreta');
      }

      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await this.userRepository.updatePassword(userId, hashedNewPassword);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao alterar senha: ' + error.message);
    }
  }

  private async generateTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  async findUsersByRole(role: string): Promise<UserResponseDto[]> {
    try {
      const users = await this.userRepository.findByRole(role);
      return users.map((user) => this.mapToResponseDto(user));
    } catch (error) {
      throw new BadRequestException(
        `Erro ao buscar usuários com role ${role}: ` + error.message,
      );
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);
      if (!result) {
        throw new NotFoundException('Usuário não encontrado');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao deletar usuário: ' + error.message);
    }
  }

  private mapToResponseDto(user: UserDocument): UserResponseDto {
    return {
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
