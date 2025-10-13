import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto, LoginUserDto, UpdateProfileDto, ChangePasswordDto } from '../dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    findUsersByRole: jest.fn(),
  };

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@escola.com',
    name: 'Test User',
    role: 'student' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@escola.com',
        name: 'Test User',
        password: 'password123',
        role: 'student',
      };

      const mockResponse = {
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refreshToken',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@escola.com',
        password: 'password123',
      };

      const mockResponse = {
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refreshToken',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto: UpdateProfileDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateDto);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
      };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword(mockUser, changePasswordDto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(mockUser.id, changePasswordDto);
    });
  });

  describe('getTeachers', () => {
    it('should return list of teachers', async () => {
      const teachers = [{ ...mockUser, role: 'teacher' as const }];
      mockAuthService.findUsersByRole.mockResolvedValue(teachers);

      const result = await controller.getTeachers();

      expect(result).toEqual(teachers);
      expect(mockAuthService.findUsersByRole).toHaveBeenCalledWith('teacher');
    });
  });

  describe('getStudents', () => {
    it('should return list of students', async () => {
      const students = [mockUser];
      mockAuthService.findUsersByRole.mockResolvedValue(students);

      const result = await controller.getStudents();

      expect(result).toEqual(students);
      expect(mockAuthService.findUsersByRole).toHaveBeenCalledWith('student');
    });
  });
});

