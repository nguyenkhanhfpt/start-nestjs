# /write-test

Write unit or e2e tests for a given service, controller, or module following the exact patterns in this project.

## Usage
```
/write-test <target> [type]
```
- `target`: module or file path, e.g. `AuthService`, `UsersController`, `src/modules/posts/posts.service.ts`
- `type`: `unit` (default) or `e2e`

## Arguments
`$ARGUMENTS` = `<target> [type]`

## Steps

### 1. Read the target file first
Read the actual source file to understand what methods/logic need tests.

### 2. Unit tests — `<name>.service.spec.ts` or `<name>.controller.spec.ts`

Follow `src/modules/auth/auth.service.spec.ts` exactly:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('<ClassName>', () => {
  let service: <ClassName>;

  const mockRepo = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockExternalService = {
    methodName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        <ClassName>,
        {
          provide: getRepositoryToken(<Entity>),
          useValue: mockRepo,
        },
        {
          provide: <ExternalService>,
          useValue: mockExternalService,
        },
      ],
    }).compile();

    service = module.get<<ClassName>>(<ClassName>);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('methodName', () => {
    it('should succeed when ...', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, ... });
      const result = await service.methodName(...);
      expect(result).toHaveProperty('id', 1);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when entity not found', async () => {
      mockRepo.findOneOrFail.mockRejectedValue(new Error());
      await expect(service.methodName(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user does not own entity', async () => {
      mockRepo.findOneOrFail.mockResolvedValue({ id: 1, userId: 2 });
      await expect(service.methodName(1, 99, {})).rejects.toThrow(ForbiddenException);
    });
  });
});
```

### 3. E2E tests — `test/<name>.e2e-spec.ts`

Follow `test/app.e2e-spec.ts` pattern:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('<Feature> (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /api/v1/<resource> → 200', () => {
    return request(app.getHttpServer())
      .get('/api/v1/<resource>')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('meta');
      });
  });

  it('POST /api/v1/<resource> → 201', () => {
    return request(app.getHttpServer())
      .post('/api/v1/<resource>')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ field: 'value' })
      .expect(201);
  });
});
```

## Conventions
- `afterEach(() => jest.clearAllMocks())` — always clear mocks between tests
- Mock at the method level, not the class level: `jest.fn()` per method on the mock object
- Test both happy path AND all error branches (not found, forbidden, duplicate, validation)
- Use `mockResolvedValue` for async mocks, `mockReturnValue` for sync
- `mockRejectedValue(new EntityNotFoundError())` to simulate TypeORM's `findOneOrFail` failure
- Do NOT test NestJS framework behavior (guard wiring, pipes) — test business logic in services
- Controller tests should mock the service entirely: `{ provide: UsersService, useValue: mockUsersService }`
- Keep test descriptions specific: `'should throw NotFoundException when user id 999 does not exist'` not `'should fail'`

## Coverage targets
Test every branch in the service:
- Happy path
- Entity not found
- Entity not owned by user (ForbiddenException)
- Duplicate/conflict (BadRequestException)
- External service failure (e.g., Redis down — graceful degradation)
