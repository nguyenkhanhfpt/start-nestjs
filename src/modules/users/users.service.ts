import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PostEntity } from '@database/entities/post.entity';
import { GetUserPostsResDto } from './dto/get-user-posts-res.dto';
import { UserItemDto } from './dto/res/user-res.dto';
import {
  PaginationQueryDto,
  PaginationMetaDto,
  PaginatedResult,
} from '@shared/dtos/pagination.dto';
import { hashPassword } from '@shared/utils';
import { plainToInstance } from 'class-transformer';

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
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<UserEntity>> {
    const [items, total] = await this.userRepository.findAndCount({
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserItemDto> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    const updated = await this.userRepository.save(user);
    return plainToInstance(UserItemDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: number): Promise<{ id: number }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { id };
  }

  async findOneBy(
    where: FindOptionsWhere<UserEntity>,
    select?: (keyof UserEntity)[],
    relations?: string[],
  ) {
    return this.userRepository.findOne({
      select: select,
      relations: relations,
      where,
    });
  }

  async findAllPosts(
    userId: number,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<GetUserPostsResDto>> {
    const [posts, total] = await this.postRepository
      .createQueryBuilder('p')
      .select(['p.id', 'p.title', 'p.content', 'p.createdAt'])
      .where('p.userId = :userId', { userId })
      .orderBy('p.createdAt', 'DESC')
      .skip(query.skip)
      .take(query.limit)
      .getManyAndCount();

    const items = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
    }));

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }
}
