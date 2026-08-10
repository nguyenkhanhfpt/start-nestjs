import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostEntity } from '@database/entities/post.entity';

jest.mock('@shared/utils', () => ({
  assertFound: jest.fn((entity, code = 'E404') => {
    if (!entity) {
      throw new NotFoundException({ code, message: code });
    }
    return entity;
  }),
}));

describe('PostsService', () => {
  let service: PostsService;

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'This is the content of my first post.',
    thumbnail: 'default.jpg',
    likeCount: 0,
    commentCount: 0,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
  };

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockPostRepository = {
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a post for the given user', async () => {
      mockPostRepository.save.mockResolvedValue(mockPost);

      const createPostDto = { title: 'Test Post', content: 'Content' };
      const result = await service.create(createPostDto as any, 1);

      expect(mockPostRepository.create).toHaveBeenCalledWith({
        ...createPostDto,
        userId: 1,
      });
      expect(mockPostRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return a cursor-paginated list without a where clause when no cursor given', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockPost]);
      mockPostRepository.query.mockResolvedValue([{ estimate: '100' }]);

      const result = await service.findAll({ limit: 10 } as any);

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({
        totalEstimate: 100,
        limit: 10,
        hasNextPage: false,
      });
    });

    it('should apply the cursor as a where clause when given', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockPost]);
      mockPostRepository.query.mockResolvedValue([{ estimate: '100' }]);

      await service.findAll({ limit: 10, cursor: 5 } as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('post.id < :cursor', {
        cursor: 5,
      });
    });

    it('should set hasNextPage and nextCursor when more rows exist than the limit', async () => {
      const rows = Array.from({ length: 11 }, (_, i) => ({
        ...mockPost,
        id: i + 1,
      }));
      mockQueryBuilder.getMany.mockResolvedValue(rows);
      mockPostRepository.query.mockResolvedValue([{ estimate: '100' }]);

      const result = await service.findAll({ limit: 10 } as any);

      expect(result.items).toHaveLength(10);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.nextCursor).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a post with its user relation when found', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true },
      });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the post when the requester is the owner', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      const updated = { ...mockPost, title: 'Updated' };
      mockPostRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { title: 'Updated' } as any, 1);

      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when the requester is not the owner', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      await expect(
        service.update(1, { title: 'Updated' } as any, 999),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove the post when the requester is the owner', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1, 1);

      expect(result).toEqual({ id: 1 });
      expect(mockPostRepository.remove).toHaveBeenCalledWith(mockPost);
    });

    it('should throw ForbiddenException when the requester is not the owner', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      await expect(service.remove(1, 999)).rejects.toThrow(ForbiddenException);
    });
  });
});
