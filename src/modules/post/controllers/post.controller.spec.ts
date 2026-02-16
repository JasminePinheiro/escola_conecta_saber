import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from '../services/post.service';
import {
  CreatePostDto,
  UpdatePostDto,
  PaginationDto,
  SearchPostsDto,
} from '../dto/post.dto';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPostService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllForTeachers: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'teacher@escola.com',
    name: 'Professor Silva',
    role: 'teacher' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPost = {
    id: '507f1f77bcf86cd799439012',
    title: 'Test Post',
    content: 'Test content',
    author: 'Professor Silva',
    tags: ['test'],
    published: true,
    status: 'published' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test content',
        tags: ['test'],
        published: true,
      };

      mockPostService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createDto, mockUser);

      expect(result).toEqual(mockPost);
      expect(createDto.author).toBe(mockUser.name);
      expect(mockPostService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockResponse = {
        data: [mockPost],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPostService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(paginationDto, undefined);

      expect(result).toEqual(mockResponse);
      expect(mockPostService.findAll).toHaveBeenCalledWith(paginationDto, undefined);
    });
  });

  describe('findAllForTeachers', () => {
    it('should return all posts including drafts', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockResponse = {
        data: [mockPost],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPostService.findAllForTeachers.mockResolvedValue(mockResponse);

      const result = await controller.findAllForTeachers(paginationDto, mockUser);

      expect(result).toEqual(mockResponse);
      expect(mockPostService.findAllForTeachers).toHaveBeenCalledWith(
        paginationDto,
        mockUser.name,
      );
    });
  });

  describe('search', () => {
    it('should search posts by query', async () => {
      const searchDto: SearchPostsDto = { query: 'test', page: 1, limit: 10 };
      const mockResponse = {
        data: [mockPost],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockPostService.search.mockResolvedValue(mockResponse);

      const result = await controller.search(searchDto, undefined);

      expect(result).toEqual(mockResponse);
      expect(mockPostService.search).toHaveBeenCalledWith(searchDto, undefined);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(
        { id: '507f1f77bcf86cd799439012' },
        undefined,
      );

      expect(result).toEqual(mockPost);
      expect(mockPostService.findOne).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        undefined,
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto: UpdatePostDto = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, title: 'Updated Title' };

      mockPostService.update.mockResolvedValue(updatedPost);

      const result = await controller.update(
        { id: '507f1f77bcf86cd799439012' },
        updateDto,
        mockUser,
      );

      expect(result).toEqual(updatedPost);
      expect(updateDto.author).toBe(mockUser.name);
      expect(mockPostService.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPostService.remove.mockResolvedValue(undefined);

      await controller.remove({ id: '507f1f77bcf86cd799439012' });

      expect(mockPostService.remove).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439012',
      );
    });
  });
});
