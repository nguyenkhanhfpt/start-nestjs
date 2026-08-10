import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '@database/entities/post.entity';
import { CreatePostDto } from './dto/req/create-post.dto';
import { UpdatePostDto } from './dto/req/update-post.dto';
import {
  CursorPaginationQueryDto,
  CursorPaginationMetaDto,
  CursorPaginatedResult,
} from '@shared/dtos/pagination.dto';
import { assertFound } from '@shared/utils';

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
    query: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResult<PostEntity>> {
    // Keyset pagination on the PK: id is SERIAL so ordering by id DESC matches
    // createdAt DESC while staying on the PK index at any depth.
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.user', 'user')
      .select([
        'post.id',
        'post.title',
        'post.thumbnail',
        'post.likeCount',
        'post.commentCount',
        'post.userId',
        'post.createdAt',
        'user.id',
        'user.name',
        'user.email',
      ])
      .orderBy('post.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      qb.where('post.id < :cursor', { cursor: query.cursor });
    }

    const [rows, totalEstimate] = await Promise.all([
      qb.getMany(),
      this.getEstimatedCount(),
    ]);

    const hasNextPage = rows.length > query.limit;
    const items = hasNextPage ? rows.slice(0, query.limit) : rows;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      meta: new CursorPaginationMetaDto(
        totalEstimate,
        query.limit,
        nextCursor,
        hasNextPage,
      ),
    };
  }

  // Planner estimate from pg_class (kept fresh by autovacuum): ~0ms vs a
  // multi-second COUNT(*) full scan on tens of millions of rows. This is the
  // one sanctioned exception to "always use Repository/QueryBuilder" in the
  // codebase, justified by posts being the only high-volume table — don't
  // copy this raw-SQL pattern to other tables without the same volume.
  private async getEstimatedCount(): Promise<number> {
    const result: { estimate: string }[] = await this.postRepository.query(
      `SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'posts'`,
    );
    return Number(result[0]?.estimate ?? 0);
  }

  async findOne(id: number) {
    return assertFound(
      await this.postRepository.findOne({
        where: { id },
        relations: { user: true },
      }),
    );
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
