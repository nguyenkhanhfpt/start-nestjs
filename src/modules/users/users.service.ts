import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/req/create-user.dto';
import { UpdateUserDto } from './dto/req/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user.entity';
import { FindOptionsWhere, QueryFailedError, Repository } from 'typeorm';
import { PostEntity } from '@database/entities/post.entity';
import { UserItemDto } from './dto/res/user-res.dto';
import { FindUsersQueryDto } from './dto/req/find-users.dto';
import {
  PaginationQueryDto,
  PaginationMetaDto,
  PaginatedResult,
} from '@shared/dtos/pagination.dto';
import { assertFound, hashPassword, t } from '@shared/utils';
import { errorCodeConstant } from '@shared/constants/error-code.constant';
import { plainToInstance } from 'class-transformer';

// Postgres unique_violation error code.
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserItemDto> {
    createUserDto.password = await hashPassword(createUserDto.password);
    const user = await this.userRepository.save(createUserDto);
    return plainToInstance(UserItemDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: FindUsersQueryDto,
  ): Promise<PaginatedResult<UserEntity>> {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere('u.name ILIKE :search', { search: `%${query.search}%` });
    }

    const [items, total] = await qb
      .skip(query.skip)
      .take(query.limit)
      .getManyAndCount();

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    return assertFound(await this.userRepository.findOne({ where: { id } }));
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserItemDto> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);

    try {
      const updated = await this.userRepository.save(user);
      return plainToInstance(UserItemDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw this.mapUniqueViolation(error);
    }
  }

  async remove(id: number): Promise<{ id: number }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { id };
  }

  existsBy(where: FindOptionsWhere<UserEntity>): Promise<boolean> {
    return this.userRepository.exists({ where });
  }

  async findAllPosts(
    userId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PostEntity>> {
    const [items, total] = await this.postRepository
      .createQueryBuilder('p')
      .select(['p.id', 'p.title', 'p.content', 'p.createdAt'])
      .where('p.userId = :userId', { userId })
      .orderBy('p.createdAt', 'DESC')
      .skip(query.skip)
      .take(query.limit)
      .getManyAndCount();

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }

  // Relies on the DB unique constraints on `username`/`email` rather than a
  // separate pre-check query, avoiding the TOCTOU race a check-then-save
  // pattern would leave open.
  private mapUniqueViolation(error: unknown): Error {
    if (
      error instanceof QueryFailedError &&
      (error as any).driverError?.code === UNIQUE_VIOLATION
    ) {
      const detail: string = (error as any).driverError?.detail ?? '';

      if (detail.includes('username')) {
        return new BadRequestException({
          code: errorCodeConstant.usernameAlreadyExists,
          message: t(`error.${errorCodeConstant.usernameAlreadyExists}`),
        });
      }

      if (detail.includes('email')) {
        return new BadRequestException({
          code: errorCodeConstant.emailAlreadyExists,
          message: t(`error.${errorCodeConstant.emailAlreadyExists}`),
        });
      }
    }

    return error as Error;
  }
}
