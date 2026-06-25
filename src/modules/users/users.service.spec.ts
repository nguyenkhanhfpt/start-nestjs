import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from '@database/entities/user.entity';
import { PostEntity } from '@database/entities/post.entity';
import * as sharedUtils from '@shared/utils';

jest.mock('@shared/utils', () => ({
  hashPassword: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    username: 'test_user',
    email: 'test@example.com',
    password: 'hashed_password',
    avatar: 'default.jpg',
    bio: 'A short bio',
    phone: '+84912345678',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    createdAt: new Date(),
  };

  const mockPaginationQuery = { page: 1, limit: 10, skip: 0 } as any;

  const mockUserRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockPostRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
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

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password, save user, and return UserItemDto', async () => {
      (sharedUtils.hashPassword as jest.Mock).mockResolvedValue(
        'hashed_password',
      );
      mockUserRepository.save.mockResolvedValue(mockUser);

      const createUserDto = {
        name: 'Test User',
        username: 'test_user',
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = await service.create(createUserDto as any);

      expect(sharedUtils.hashPassword).toHaveBeenCalledWith('Password123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed_password' }),
      );
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('username', 'test_user');
    });
  });

  describe('findAll', () => {
    it('should return paginated list of users', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll(mockPaginationQuery);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('meta');
      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty list when no users exist', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(mockPaginationQuery);

      expect(result.items).toHaveLength(0);
      expect(result.meta).toMatchObject({ total: 0 });
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when user with given id does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'User with ID "999" not found',
      );
    });
  });

  describe('update', () => {
    it('should update user fields and return updated UserItemDto', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, { name: 'Updated Name' } as any);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });

    it('should hash new password when password field is provided', async () => {
      (sharedUtils.hashPassword as jest.Mock).mockResolvedValue('new_hashed');
      const updatedUser = { ...mockUser, password: 'new_hashed' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      await service.update(1, { password: 'NewPassword123' } as any);

      expect(sharedUtils.hashPassword).toHaveBeenCalledWith('NewPassword123');
    });

    it('should throw NotFoundException when updating a non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove the user and return the deleted id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(result).toEqual({ id: 1 });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when removing a non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneBy', () => {
    it('should find a user by given conditions', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneBy({ email: 'test@example.com' });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        select: undefined,
        relations: undefined,
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when no user matches the given conditions', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneBy({ email: 'nobody@example.com' });

      expect(result).toBeNull();
    });
  });

  describe('findAllPosts', () => {
    it('should return paginated posts for a user', async () => {
      const postWithDate = { ...mockPost, createdAt: new Date('2024-01-01') };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[postWithDate], 1]);

      const result = await service.findAllPosts(1, mockPaginationQuery);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('meta');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('title', 'Test Post');
      expect(typeof result.items[0].createdAt).toBe('string');
      expect(result.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'p.userId = :userId',
        { userId: 1 },
      );
    });

    it('should return empty items when user has no posts', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAllPosts(999, mockPaginationQuery);

      expect(result.items).toHaveLength(0);
      expect(result.meta).toMatchObject({ total: 0 });
    });
  });
});
