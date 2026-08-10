import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserPointEntity } from '@database/entities/user-point.entity';
import { UserPointHistoryEntity } from '@database/entities/user-point-history.entity';
import { AdjustUserPointDto } from './dto/req/adjust-user-point.dto';
import { FindUserPointHistoriesQueryDto } from './dto/req/find-user-point-histories.dto';
import {
  PaginationQueryDto,
  PaginationMetaDto,
  PaginatedResult,
} from '@shared/dtos/pagination.dto';
import { PointTransactionType } from '@shared/enums/point-transaction-type.enum';
import { errorCodeConstant } from '@shared/constants/error-code.constant';
import { t } from '@shared/utils';

@Injectable()
export class UserPointsService {
  constructor(
    @InjectRepository(UserPointEntity)
    private readonly userPointRepository: Repository<UserPointEntity>,
    @InjectRepository(UserPointHistoryEntity)
    private readonly userPointHistoryRepository: Repository<UserPointHistoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get a user's point balance, auto-provisioning a zero-balance record on
   * first access so callers never need a separate "create" step.
   */
  async findOne(userId: number): Promise<UserPointEntity> {
    return this.getOrCreate(this.userPointRepository, userId);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<UserPointEntity>> {
    const [items, total] = await this.userPointRepository.findAndCount({
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }

  /**
   * Atomically applies an increase/decrease to a user's balance and writes
   * the corresponding audit history row. A pessimistic write lock on the
   * user_points row prevents concurrent adjustments from racing past the
   * insufficient-balance check.
   */
  async adjust(
    userId: number,
    dto: AdjustUserPointDto,
    performedBy: number,
  ): Promise<UserPointEntity> {
    return this.dataSource.transaction(async (manager) => {
      const pointRepo = manager.getRepository(UserPointEntity);
      const historyRepo = manager.getRepository(UserPointHistoryEntity);

      let userPoint = await pointRepo.findOne({
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!userPoint) {
        userPoint = await pointRepo.save(
          pointRepo.create({ userId, balance: 0 }),
        );
      }

      const delta = this.resolveDelta(dto.type, dto.amount);

      if (
        dto.type === PointTransactionType.DECREASE &&
        userPoint.balance < dto.amount
      ) {
        throw new BadRequestException({
          code: errorCodeConstant.insufficientBalance,
          message: t(`error.${errorCodeConstant.insufficientBalance}`),
        });
      }

      await pointRepo.increment({ userId }, 'balance', delta);
      const updated = await pointRepo.findOneOrFail({ where: { userId } });

      await historyRepo.save(
        historyRepo.create({
          userId,
          type: dto.type,
          amount: dto.amount,
          balanceAfter: updated.balance,
          note: dto.note,
          performedBy,
        }),
      );

      return updated;
    });
  }

  async findHistories(
    userId: number,
    query: FindUserPointHistoriesQueryDto,
  ): Promise<PaginatedResult<UserPointHistoryEntity>> {
    const [items, total] = await this.userPointHistoryRepository.findAndCount({
      where: { userId },
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }

  /**
   * Resolves the signed delta to apply to the balance for a given
   * transaction type. Uses an exhaustive switch so adding a new
   * PointTransactionType member without updating this method is a
   * compile-time error.
   */
  private resolveDelta(type: PointTransactionType, amount: number): number {
    switch (type) {
      case PointTransactionType.INCREASE:
        return amount;
      case PointTransactionType.DECREASE:
        return -amount;
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unhandled point transaction type: ${exhaustiveCheck}`);
      }
    }
  }

  private async getOrCreate(
    repo: Repository<UserPointEntity>,
    userId: number,
  ): Promise<UserPointEntity> {
    let userPoint = await repo.findOne({ where: { userId } });
    if (!userPoint) {
      userPoint = await repo.save(repo.create({ userId, balance: 0 }));
    }
    return userPoint;
  }
}
