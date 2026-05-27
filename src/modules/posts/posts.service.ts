import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '@database/entities/post.entity';
import { CreatePostDto } from './dto/req/create-post.dto';
import { UpdatePostDto } from './dto/req/update-post.dto';
import {
  PaginationQueryDto,
  PaginationMetaDto,
  PaginatedResult,
} from '@shared/dtos/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  create(createPostDto: CreatePostDto, userId: number) {
    const post = this.postRepository.create({
      ...createPostDto,
      userId,
    });
    return this.postRepository.save(post);
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PostEntity>> {
    const [items, total] = await this.postRepository.findAndCount({
      relations: ['user'],
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      meta: new PaginationMetaDto(total, query.page, query.limit),
    };
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number, userId: number) {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    await this.postRepository.remove(post);
    return { id };
  }
}
