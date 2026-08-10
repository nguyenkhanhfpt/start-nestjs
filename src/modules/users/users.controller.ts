import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.dto';
import { UpdateUserDto } from './dto/req/update-user.dto';
import { FindUsersQueryDto } from './dto/req/find-users.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ApiErrorsResponse, ApiGetErrorsResponse } from '@decorators';
import { PaginatedUserPostsDto } from './dto/res/get-user-posts-res.dto';
import { UserItemDto, PaginatedUsersDto } from './dto/res/user-res.dto';
import { Serialize } from '@interceptors';
import { PaginationQueryDto } from '@shared/dtos/pagination.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
    type: UserItemDto,
  })
  @ApiErrorsResponse()
  @Serialize(UserItemDto)
  create(@Body() createUserDto: CreateUserDto): Promise<UserItemDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users (paginated), optionally searching by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of users.',
    type: PaginatedUsersDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(PaginatedUsersDto)
  findAll(@Query() query: FindUsersQueryDto): Promise<PaginatedUsersDto> {
    return this.usersService.findAll(query) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user with the specified ID.',
    type: UserItemDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(UserItemDto)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserItemDto> {
    return this.usersService.findOne(id) as any;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully updated.',
    type: UserItemDto,
  })
  @ApiErrorsResponse()
  @Serialize(UserItemDto)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserItemDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully deleted.',
    schema: { example: { id: 1 } },
  })
  @ApiGetErrorsResponse()
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.usersService.remove(id);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'Get all posts by user (paginated)' })
  @ApiParam({ name: 'id', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of posts by user.',
    type: PaginatedUserPostsDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(PaginatedUserPostsDto)
  findAllPosts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedUserPostsDto> {
    return this.usersService.findAllPosts(id, query) as any;
  }
}
