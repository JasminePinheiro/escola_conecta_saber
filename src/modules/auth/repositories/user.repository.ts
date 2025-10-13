import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model.js';
import { IUserRepository } from './user.repository.interface.js';
import { RegisterUserDto, UpdateProfileDto } from '../dto/auth.dto.js';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userData: RegisterUserDto & { password: string }): Promise<UserDocument> {
    const user = new this.userModel({
      ...userData,
      isActive: true,
    });
    return user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByRole(role: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ role, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, userData: Partial<UpdateProfileDto>): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, userData, { new: true, runValidators: true })
      .exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { password: hashedPassword }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }
}

