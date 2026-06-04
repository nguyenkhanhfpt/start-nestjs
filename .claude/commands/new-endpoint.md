# /new-endpoint

Add a new REST endpoint to an existing module, following the exact patterns in this project.

## Usage
```
/new-endpoint <ModuleName> <method> <path> [description]
```
Examples:
- `/new-endpoint User GET profile Get current user profile`
- `/new-endpoint Post POST bulk-delete Bulk delete posts by ids`

## Arguments
`$ARGUMENTS` = `<ModuleName> <method> <path> [description]`

## Steps to perform

### 1. Identify the module
Read `src/modules/<name>/<name>.controller.ts` and `src/modules/<name>/<name>.service.ts` to understand current patterns.

### 2. Add the service method
In `<name>.service.ts`:
- Use existing repository injection — do NOT add new constructor params unless truly needed
- For queries: `findAndCount` for lists, `findOneOrFail` for single item
- Throw `NotFoundException` if entity not found
- Throw `ForbiddenException` if ownership check fails (compare `entity.userId !== userId`)
- Return `plainToInstance(ResDto, data, { excludeExtraneousValues: true })` for single items
- Return `{ items, meta: new PaginationMetaDto(...) }` for paginated lists

### 3. Add the controller method
In `<name>.controller.ts`, follow this exact decorator order:
```typescript
@ApiOperation({ summary: '...' })
@ApiResponse({ status: ..., description: '...', type: ResDto })
@ApiErrorsResponse() // or @ApiGetErrorsResponse() for GET
@Serialize(ResDto)
@HttpCode(statusCode) // only if not 200
@<Method>('<path>')
async methodName(
  @UserDecorator('id') userId: number,
  @Param('id') id: string,   // for :id routes
  @Query() query: QueryDto,  // for GET list
  @Body() dto: RequestDto,   // for POST/PATCH
): Promise<ResDto> {
  return this.service.methodName(+id, userId, dto);
}
```

### 4. Create DTOs if needed
**Request DTO** `dtos/req/<action>-<name>.dto.ts`:
- Add `public static readonly resource = <Entity>.name`
- `@ApiProperty({ example: ..., description: ... })` on every field
- Use class-validator decorators appropriate to the field type

**Response DTO** `dtos/res/<name>-res.dto.ts` (usually already exists — add new fields with `@Expose()`):
- `@Expose()` on every field to include in the response
- `@Type(() => NestedDto)` for nested objects

### 5. Validation
- If the DTO needs custom async validation (e.g., unique email check), create a validator in `src/shared/validators/` following `is-exist-email.validator.ts`
- Register it in the module's providers array

## Conventions
- `@Param('id') id: string` → always convert with `+id` when passing to service
- `@UserDecorator()` returns full `UserEntity`; `@UserDecorator('id')` returns just the id
- Use `@Public()` decorator ONLY for routes that don't require authentication
- Use `@ThrottleLogin()` / `@ThrottleRegister()` / `@ThrottleRefresh()` for auth-sensitive endpoints
- DELETE endpoints return HTTP 204 with no body — use `@HttpCode(HttpStatus.NO_CONTENT)` and `Promise<void>`
- PATCH is preferred over PUT for partial updates
