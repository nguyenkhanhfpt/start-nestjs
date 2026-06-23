import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '@shared/dtos/pagination.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedUsers = {
    items: [mockUser],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllPosts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return the result', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = await controller.create(createUserDto as any);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of users', async () => {
      mockUsersService.findAll.mockResolvedValue(mockPaginatedUsers);

      const query: PaginationQueryDto = { page: 1, limit: 10 } as any;
      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedUsers);
      expect(usersService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(usersService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated result', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const updateUserDto = { name: 'Updated Name' };
      const result = await controller.update('1', updateUserDto as any);

      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(controller.update('999', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user and return the deleted id', async () => {
      mockUsersService.remove.mockResolvedValue({ id: 1 });

      const result = await controller.remove('1');

      expect(result).toEqual({ id: 1 });
      expect(usersService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPosts', () => {
    it('should return paginated list of posts for a user', async () => {
      const mockPaginatedPosts = {
        items: [{ id: 1, title: 'Post 1', content: 'Content', createdAt: new Date().toISOString() }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockUsersService.findAllPosts.mockResolvedValue(mockPaginatedPosts);

      const query: PaginationQueryDto = { page: 1, limit: 10 } as any;
      const result = await controller.findAllPosts(1, query);

      expect(result).toEqual(mockPaginatedPosts);
      expect(usersService.findAllPosts).toHaveBeenCalledWith(1, query);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.findAllPosts.mockRejectedValue(
        new NotFoundException('User with ID "999" not found'),
      );

      await expect(
        controller.findAllPosts(999, { page: 1, limit: 10 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
