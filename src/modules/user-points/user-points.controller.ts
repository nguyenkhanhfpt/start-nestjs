import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ApiErrorsResponse, ApiGetErrorsResponse, Roles } from '@decorators';
import { RolesGuard } from '@guards';
import { Serialize } from '@interceptors';
import { User as UserDecorator } from '@decorators/user.decorator';
import { PaginationQueryDto } from '@shared/dtos/pagination.dto';
import { Role } from '@shared/enums/role.enum';
import { UserPointsService } from './user-points.service';
import { AdjustUserPointDto } from './dto/req/adjust-user-point.dto';
import { FindUserPointHistoriesQueryDto } from './dto/req/find-user-point-histories.dto';
import {
  UserPointItemDto,
  PaginatedUserPointsDto,
} from './dto/res/user-point-res.dto';
import { PaginatedUserPointHistoriesDto } from './dto/res/user-point-history-res.dto';

@ApiBearerAuth()
@ApiTags('User Points')
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
@Controller('user-points')
export class UserPointsController {
  constructor(private readonly userPointsService: UserPointsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users point balances (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of user point balances.',
    type: PaginatedUserPointsDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(PaginatedUserPointsDto)
  findAll(@Query() query: PaginationQueryDto): Promise<PaginatedUserPointsDto> {
    return this.userPointsService.findAll(query) as any;
  }

  @Get(':userId')
  @ApiOperation({ summary: "Get a user's point balance" })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: "Returns the user's point balance.",
    type: UserPointItemDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(UserPointItemDto)
  findOne(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserPointItemDto> {
    return this.userPointsService.findOne(userId) as any;
  }

  @Post(':userId/adjust')
  @ApiOperation({
    summary: "Increase or decrease a user's point balance",
    description:
      'Atomically applies the adjustment and writes an audit history record.',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 201,
    description: 'Point balance has been successfully adjusted.',
    type: UserPointItemDto,
  })
  @ApiErrorsResponse()
  @Serialize(UserPointItemDto)
  adjust(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() adjustUserPointDto: AdjustUserPointDto,
    @UserDecorator('id') adminId: number,
  ): Promise<UserPointItemDto> {
    return this.userPointsService.adjust(
      userId,
      adjustUserPointDto,
      adminId,
    ) as any;
  }

  @Get(':userId/histories')
  @ApiOperation({
    summary: "Get a user's point transaction history (paginated)",
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of point transaction history.',
    type: PaginatedUserPointHistoriesDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(PaginatedUserPointHistoriesDto)
  findHistories(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindUserPointHistoriesQueryDto,
  ): Promise<PaginatedUserPointHistoriesDto> {
    return this.userPointsService.findHistories(userId, query) as any;
  }
}
