import { UserDocument } from '../models/user.model.js';
import { RegisterUserDto, UpdateProfileDto } from '../dto/auth.dto.js';

export interface IUserRepository {
  create(
    userData: RegisterUserDto & { password: string },
  ): Promise<UserDocument>;
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  findByRole(role: string): Promise<UserDocument[]>;
  update(
    id: string,
    userData: Partial<UpdateProfileDto>,
  ): Promise<UserDocument | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
}
