import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../../modules/auth/services/auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  const mockAuthService = {
    findUserById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret-key'),
  };

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@escola.com',
    name: 'Test User',
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user', async () => {
      const payload = { sub: '507f1f77bcf86cd799439011', email: 'test@escola.com', role: 'student' };
      mockAuthService.findUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.findUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = { sub: 'nonexistent', email: 'test@escola.com', role: 'student' };
      mockAuthService.findUserById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const payload = { sub: '507f1f77bcf86cd799439011', email: 'test@escola.com', role: 'student' };
      const inactiveUser = { ...mockUser, isActive: false };
      mockAuthService.findUserById.mockResolvedValue(inactiveUser);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});

