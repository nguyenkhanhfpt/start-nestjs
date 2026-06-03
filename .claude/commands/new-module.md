# /new-module

Generate a complete NestJS feature module following the exact patterns in this project.

## Usage
```
/new-module <ModuleName>
```
Example: `/new-module Product`

## What to generate

Given module name `$ARGUMENTS`, generate ALL of the following files:

### 1. Entity — `src/database/entities/<name>.entity.ts`
Follow `src/database/entities/post.entity.ts` pattern:
- Extend `BaseEntity` from `@database/entities/base.entity`
- Use snake_case for column names: `@Column({ name: 'user_id' })`
- Add `@Column('text')` for long strings
- Add `@ManyToOne`/`@OneToMany` if related to User, include `@JoinColumn({ name: 'user_id' })`
- Add `@Exclude()` on sensitive fields with `select: false`
- Add `userId: number` alongside the relation

### 2. Request DTOs — `src/modules/<name>/dtos/req/`

**`create-<name>.dto.ts`**:
- Add `public static readonly resource = <Entity>.name`
- Use `@ApiProperty({ example: ..., description: ... })` on every field
- Validators: `@IsNotEmpty()`, `@IsString()`, `@IsOptional()`, `@MinLength()`, `@MaxLength()`, `@IsEnum()`, `@IsInt()`, `@Min()`, `@Max()` as appropriate
- Use `@Matches()` with regex for password/special patterns

**`update-<name>.dto.ts`**:
- Extend `PartialType(Create<Name>Dto)` from `@nestjs/swagger`

### 3. Response DTOs — `src/modules/<name>/dtos/res/<name>-res.dto.ts`

Follow `src/modules/users/dtos/res/user-res.dto.ts` pattern:
- `<Name>ItemDto`: all fields with `@Expose()`, nest with `@Type(() => NestedDto)`
- `Paginated<Name>Dto extends PaginatedDto(<Name>ItemDto)` from `@shared/dtos/pagination.dto`

### 4. Service — `src/modules/<name>/<name>.service.ts`
Follow `src/modules/users/users.service.ts` and `src/modules/posts/posts.service.ts`:
- Inject via constructor: `@InjectRepository(<Name>Entity) private readonly <name>Repo: Repository<<Name>Entity>`
- `private readonly logger = new Logger(<Name>Service.name)`
- `findAll(query: PaginationQueryDto)` → `findAndCount({ skip: query.skip, take: query.limit, order: { createdAt: 'DESC' } })` → return `{ items, meta: new PaginationMetaDto(...) }`
- `findOne(id: number)` → `findOneOrFail({ where: { id } })` then throw `NotFoundException` if not found
- `create(dto, userId?)` → save entity and return `plainToInstance(<Name>ItemDto, entity, { excludeExtraneousValues: true })`
- `update(id, userId, dto)` → check `entity.userId !== userId` → throw `ForbiddenException`
- `remove(id, userId)` → same ownership check pattern

### 5. Controller — `src/modules/<name>/<name>.controller.ts`
Follow `src/modules/posts/posts.controller.ts` pattern:
- `@ApiTags('<name>s')`, `@ApiBearerAuth()`, `@Controller('<name>s')`
- All endpoints use `@Serialize(<Name>ItemDto)` or `@Serialize(Paginated<Name>Dto)`
- Use `@ApiErrorsResponse()` / `@ApiGetErrorsResponse()` on each method
- Extract user: `@User('id') userId: number` via `@UserDecorator`
- GET list: `@Get()` with `@Query() query: PaginationQueryDto`
- GET one: `@Get(':id')` with `@Param('id') id: string` → `+id`
- POST: `@Post()` with `@Body() dto: Create<Name>Dto`
- PATCH: `@Patch(':id')` with `@Body() dto: Update<Name>Dto`
- DELETE: `@Delete(':id')` → return `HttpCode(204)`

### 6. Module — `src/modules/<name>/<name>.module.ts`
- `TypeOrmModule.forFeature([<Name>Entity])`
- Register controller and service
- Export service if needed by other modules

### 7. Register in AppModule
- Add `<Name>Module` to imports array in `src/app.module.ts`

### 8. I18n translations
- Add validation keys in `src/i18n/en/error.<name>.json` and `src/i18n/vi/error.<name>.json` following the pattern in `src/i18n/en/error.UserEntity.json`

## Code conventions to follow
- Imports use path aliases: `@database/entities/...`, `@modules`, `@guards`, `@decorators`, `@filters`, `@shared/...`
- No comments unless the WHY is non-obvious
- No `async/await` when returning a promise directly
- `plainToInstance` with `{ excludeExtraneousValues: true }` for response transformation
- Throw NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`
- Never use `find()` when `findOneOrFail()` applies — let TypeORM throw, catch in filter

After generating all files, show a summary list of created files and remind the user to:
1. Generate a migration: `npm run migration:generate --name=create_<name>s_table`
2. Run it: `npm run migration:up`
