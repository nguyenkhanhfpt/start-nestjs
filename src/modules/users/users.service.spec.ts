import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from '@database/entities/user.entity';
import { PostEntity } from '@database/entities/post.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: any;
  let mockPostRepository: any;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    userId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
    };

    mockPostRepository = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(mockUserRepository, 'find').mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should return empty array if no users', async () => {
      jest.spyOn(mockUserRepository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(mockUserRepository, 'findOneOrFail').mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw if user not found', async () => {
      jest
        .spyOn(mockUserRepository, 'findOneOrFail')
        .mockRejectedValue(new Error('User not found'));

      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('findAllPosts', () => {
    it('should return posts for a user', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPost]),
      };

      jest
        .spyOn(mockPostRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const result = await service.findAllPosts(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe('Test Post');
    });

    it('should return empty array if user has no posts', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(mockPostRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const result = await service.findAllPosts(1);

      expect(result).toEqual([]);
    });
  });

  describe('findOneBy', () => {
    it('should find user with specific conditions', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOneBy({ email: 'test@example.com' });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });
  });
});
