import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserPointsController } from './user-points.controller';
import { UserPointsService } from './user-points.service';
import { PointTransactionType } from '@shared/enums/point-transaction-type.enum';

describe('UserPointsController', () => {
  let controller: UserPointsController;
  let service: UserPointsService;

  const mockUserPoint = {
    id: 1,
    userId: 1,
    balance: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginated = {
    items: [mockUserPoint],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  const mockUserPointsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    adjust: jest.fn(),
    findHistories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPointsController],
      providers: [
        { provide: UserPointsService, useValue: mockUserPointsService },
      ],
    }).compile();

    controller = module.get<UserPointsController>(UserPointsController);
    service = module.get<UserPointsService>(UserPointsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated point balances', async () => {
      mockUserPointsService.findAll.mockResolvedValue(mockPaginated);

      const query = { page: 1, limit: 10 } as any;
      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginated);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a user point balance by userId', async () => {
      mockUserPointsService.findOne.mockResolvedValue(mockUserPoint);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUserPoint);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('adjust', () => {
    it('should delegate to the service with parsed userId and admin id', async () => {
      const updated = { ...mockUserPoint, balance: 150 };
      mockUserPointsService.adjust.mockResolvedValue(updated);

      const dto = {
        type: PointTransactionType.INCREASE,
        amount: 50,
      } as any;

      const result = await controller.adjust(1, dto, 99);

      expect(result).toEqual(updated);
      expect(service.adjust).toHaveBeenCalledWith(1, dto, 99);
    });

    it('should propagate BadRequestException from the service', async () => {
      mockUserPointsService.adjust.mockRejectedValue(
        new BadRequestException('Insufficient point balance'),
      );

      const dto = {
        type: PointTransactionType.DECREASE,
        amount: 999999,
      } as any;

      await expect(controller.adjust(1, dto, 99)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findHistories', () => {
    it('should return paginated point history for a user', async () => {
      const mockHistories = {
        items: [
          {
            id: 1,
            userId: 1,
            type: PointTransactionType.INCREASE,
            amount: 50,
            balanceAfter: 150,
            createdAt: new Date(),
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockUserPointsService.findHistories.mockResolvedValue(mockHistories);

      const query = { page: 1, limit: 10 } as any;
      const result = await controller.findHistories(1, query);

      expect(result).toEqual(mockHistories);
      expect(service.findHistories).toHaveBeenCalledWith(1, query);
    });
  });
});
