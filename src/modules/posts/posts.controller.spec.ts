import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CursorPaginationQueryDto } from '@shared/dtos/pagination.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

  const mockPost = {
    id: 1,
    title: 'Test Post',
    content: 'This is the content of my first post.',
    thumbnail: 'default.jpg',
    likeCount: 0,
    commentCount: 0,
    userId: 1,
    createdAt: new Date(),
    user: mockUser,
  };

  const mockPaginatedPosts = {
    items: [mockPost],
    meta: { totalEstimate: 1, limit: 10, nextCursor: null, hasNextPage: false },
  };

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post for the authenticated user', async () => {
      mockPostsService.create.mockResolvedValue(mockPost);

      const createPostDto = { title: 'Test Post', content: 'Content' };
      const result = await controller.create(createPostDto as any, 1);

      expect(result).toEqual(mockPost);
      expect(postsService.create).toHaveBeenCalledWith(createPostDto, 1);
    });
  });

  describe('findAll', () => {
    it('should return a cursor-paginated list of posts', async () => {
      mockPostsService.findAll.mockResolvedValue(mockPaginatedPosts);

      const query: CursorPaginationQueryDto = { limit: 10 } as any;
      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedPosts);
      expect(postsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPost);
      expect(postsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when the post does not exist', async () => {
      mockPostsService.findOne.mockRejectedValue(
        new NotFoundException({ code: 'E404', message: 'Not found' }),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the post and return the result', async () => {
      const updatedPost = { ...mockPost, title: 'Updated' };
      mockPostsService.update.mockResolvedValue(updatedPost);

      const updatePostDto = { title: 'Updated' };
      const result = await controller.update(
        1,
        updatePostDto as any,
        mockUser as any,
      );

      expect(result).toEqual(updatedPost);
      expect(postsService.update).toHaveBeenCalledWith(
        1,
        updatePostDto,
        mockUser.id,
      );
    });

    it('should throw ForbiddenException when the requester does not own the post', async () => {
      mockPostsService.update.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to update this post',
        ),
      );

      await expect(
        controller.update(1, {} as any, mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove the post and return the deleted id', async () => {
      mockPostsService.remove.mockResolvedValue({ id: 1 });

      const result = await controller.remove(1, mockUser as any);

      expect(result).toEqual({ id: 1 });
      expect(postsService.remove).toHaveBeenCalledWith(1, mockUser.id);
    });

    it('should throw ForbiddenException when the requester does not own the post', async () => {
      mockPostsService.remove.mockRejectedValue(
        new ForbiddenException(
          'You do not have permission to delete this post',
        ),
      );

      await expect(controller.remove(1, mockUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
