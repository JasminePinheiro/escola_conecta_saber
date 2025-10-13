import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostService } from './post.service';
import { PostRepository } from '../repositories/post.repository';

describe('PostService', () => {
  let service: PostService;
  let repository: PostRepository;

  const mockPostRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    countDocuments: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
    countSearchResults: jest.fn(),
  };

  const mockPost = {
    _id: '507f1f77bcf86cd799439012',
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
      providers: [
        PostService,
        {
          provide: PostRepository,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    repository = module.get<PostRepository>(PostRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createDto = {
        title: 'Test Post',
        content: 'Test content',
        author: 'Professor Silva',
        tags: ['test'],
        published: true,
      };

      mockPostRepository.create.mockResolvedValue(mockPost);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createDto.title);
      expect(mockPostRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated published posts', async () => {
      mockPostRepository.findAll.mockResolvedValue([mockPost]);
      mockPostRepository.countDocuments.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(mockPostRepository.findAll).toHaveBeenCalledWith(0, 10, true);
    });
  });

  describe('findAllForTeachers', () => {
    it('should return all posts including drafts', async () => {
      mockPostRepository.findAll.mockResolvedValue([mockPost]);
      mockPostRepository.countDocuments.mockResolvedValue(1);

      const result = await service.findAllForTeachers({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(mockPostRepository.findAll).toHaveBeenCalledWith(0, 10, false);
    });
  });

  describe('findOne', () => {
    it('should find a post by id', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPost);

      const result = await service.findOne('507f1f77bcf86cd799439012');

      expect(result.id).toBe(mockPost._id);
      expect(mockPostRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedPost = { ...mockPost, title: 'Updated Title' };

      mockPostRepository.update.mockResolvedValue(updatedPost);

      const result = await service.update('507f1f77bcf86cd799439012', updateDto);

      expect(result.title).toBe('Updated Title');
      expect(mockPostRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439012', updateDto);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.update.mockResolvedValue(null);

      await expect(service.update('nonexistent', { title: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPostRepository.delete.mockResolvedValue(mockPost);

      await service.remove('507f1f77bcf86cd799439012');

      expect(mockPostRepository.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.delete.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search posts by query', async () => {
      mockPostRepository.search.mockResolvedValue([mockPost]);
      mockPostRepository.countSearchResults.mockResolvedValue(1);

      const result = await service.search({ query: 'test', page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(mockPostRepository.search).toHaveBeenCalledWith('test', 0, 10);
    });
  });
});

