import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserPointsService } from './user-points.service';
import { UserPointEntity } from '@database/entities/user-point.entity';
import { UserPointHistoryEntity } from '@database/entities/user-point-history.entity';
import { PointTransactionType } from '@shared/enums/point-transaction-type.enum';
import * as sharedUtils from '@shared/utils';

jest.mock('@shared/utils', () => ({
  t: jest.fn((key: string) => key),
}));

describe('UserPointsService', () => {
  let service: UserPointsService;

  const mockUserPoint = {
    id: 1,
    userId: 1,
    balance: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginationQuery = { page: 1, limit: 10, skip: 0 } as any;

  const mockUserPointRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn((data) => data),
  };

  const mockUserPointHistoryRepository = {
    findAndCount: jest.fn(),
  };

  // Mocked transactional repositories used inside dataSource.transaction()
  const mockTxPointRepo = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    save: jest.fn(),
    create: jest.fn((data) => data),
    increment: jest.fn(),
  };

  const mockTxHistoryRepo = {
    save: jest.fn(),
    create: jest.fn((data) => data),
  };

  const mockManager = {
    getRepository: jest.fn((entity) => {
      if (entity === UserPointEntity) return mockTxPointRepo;
      if (entity === UserPointHistoryEntity) return mockTxHistoryRepo;
      return undefined;
    }),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPointsService,
        {
          provide: getRepositoryToken(UserPointEntity),
          useValue: mockUserPointRepository,
        },
        {
          provide: getRepositoryToken(UserPointHistoryEntity),
          useValue: mockUserPointHistoryRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UserPointsService>(UserPointsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the existing point record', async () => {
      mockUserPointRepository.findOne.mockResolvedValue(mockUserPoint);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUserPoint);
      expect(mockUserPointRepository.save).not.toHaveBeenCalled();
    });

    it('should auto-create a zero-balance record when none exists', async () => {
      mockUserPointRepository.findOne.mockResolvedValue(null);
      const created = { userId: 1, balance: 0 };
      mockUserPointRepository.save.mockResolvedValue(created);

      const result = await service.findOne(1);

      expect(mockUserPointRepository.save).toHaveBeenCalledWith({
        userId: 1,
        balance: 0,
      });
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of point balances', async () => {
      mockUserPointRepository.findAndCount.mockResolvedValue([
        [mockUserPoint],
        1,
      ]);

      const result = await service.findAll(mockPaginationQuery);

      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
    });
  });

  describe('adjust', () => {
    const performedBy = 99;

    it('should increase the balance and record history', async () => {
      mockTxPointRepo.findOne.mockResolvedValue({ userId: 1, balance: 100 });
      mockTxPointRepo.findOneOrFail.mockResolvedValue({
        userId: 1,
        balance: 150,
      });

      const dto = {
        type: PointTransactionType.INCREASE,
        amount: 50,
        note: 'bonus',
      };

      const result = await service.adjust(1, dto as any, performedBy);

      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockTxPointRepo.increment).toHaveBeenCalledWith(
        { userId: 1 },
        'balance',
        50,
      );
      expect(mockTxHistoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          type: PointTransactionType.INCREASE,
          amount: 50,
          balanceAfter: 150,
          note: 'bonus',
          performedBy,
        }),
      );
      expect(result).toEqual({ userId: 1, balance: 150 });
    });

    it('should decrease the balance when there are enough points', async () => {
      mockTxPointRepo.findOne.mockResolvedValue({ userId: 1, balance: 100 });
      mockTxPointRepo.findOneOrFail.mockResolvedValue({
        userId: 1,
        balance: 40,
      });

      const dto = { type: PointTransactionType.DECREASE, amount: 60 };

      const result = await service.adjust(1, dto as any, performedBy);

      expect(mockTxPointRepo.increment).toHaveBeenCalledWith(
        { userId: 1 },
        'balance',
        -60,
      );
      expect(result.balance).toBe(40);
    });

    it('should throw BadRequestException when balance is insufficient', async () => {
      mockTxPointRepo.findOne.mockResolvedValue({ userId: 1, balance: 10 });

      const dto = { type: PointTransactionType.DECREASE, amount: 60 };

      await expect(service.adjust(1, dto as any, performedBy)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockTxPointRepo.increment).not.toHaveBeenCalled();
      expect(mockTxHistoryRepo.save).not.toHaveBeenCalled();
      expect(sharedUtils.t).toHaveBeenCalledWith('error.E4004');
    });

    it('should auto-provision a zero-balance record when adjusting a user with none yet', async () => {
      mockTxPointRepo.findOne.mockResolvedValue(null);
      mockTxPointRepo.save.mockResolvedValue({ userId: 2, balance: 0 });
      mockTxPointRepo.findOneOrFail.mockResolvedValue({
        userId: 2,
        balance: 20,
      });

      const dto = { type: PointTransactionType.INCREASE, amount: 20 };

      await service.adjust(2, dto as any, performedBy);

      expect(mockTxPointRepo.save).toHaveBeenCalledWith({
        userId: 2,
        balance: 0,
      });
      expect(mockTxPointRepo.increment).toHaveBeenCalledWith(
        { userId: 2 },
        'balance',
        20,
      );
    });
  });

  describe('findHistories', () => {
    it('should return paginated point history for a user', async () => {
      const history = {
        id: 1,
        userId: 1,
        type: PointTransactionType.INCREASE,
        amount: 50,
        balanceAfter: 150,
        createdAt: new Date(),
      };
      mockUserPointHistoryRepository.findAndCount.mockResolvedValue([
        [history],
        1,
      ]);

      const result = await service.findHistories(1, mockPaginationQuery);

      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
      expect(mockUserPointHistoryRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });
  });
});
