import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '@modules/auth/dtos/req/login.dto';
import { RegisterDto } from '@modules/auth/dtos/req/register.dto';
import {
  ApiErrorsResponse,
  ApiGetErrorsResponse,
  Public,
  User,
  ThrottleLogin,
  ThrottleRegister,
  ThrottleRefresh,
} from '@decorators';
import { RefreshTokenGuard } from '@guards';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetTokenDto, LoginResDto } from './dtos/res/login-res.dto';
import { GetUserResDto } from './dtos/res';
import { Serialize } from '@interceptors';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ThrottleLogin()
  @Post('login')
  @ApiOperation({ summary: 'Login', description: 'User login endpoint' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
    type: LoginResDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts. Please try again later.',
  })
  @ApiBody({ type: LoginDto })
  @ApiErrorsResponse({
    excludeUnauthorized: true,
  })
  @Serialize(LoginResDto)
  async login(@Body() loginDto: LoginDto): Promise<LoginResDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @ThrottleRegister()
  @Post('register')
  @ApiOperation({ summary: 'Register', description: 'User register endpoint' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully registered.',
    type: LoginResDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts. Please try again later.',
  })
  @ApiErrorsResponse({
    excludeUnauthorized: true,
  })
  @Serialize(LoginResDto)
  async register(@Body() registerDto: RegisterDto): Promise<LoginResDto> {
    return this.authService.register(registerDto);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout', description: 'User logout endpoint' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged out.',
    type: Boolean,
  })
  @ApiGetErrorsResponse()
  async logout(@Request() request: any): Promise<boolean> {
    const token = this.extractTokenFromHeader(request);
    return this.authService.logout(token);
  }

  /**
   * Extract JWT token from Authorization header
   * @param request - HTTP request object
   * @returns Token string or undefined
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Refresh token
   * @param user
   */
  @Public()
  @ThrottleRefresh()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Refresh access token endpoint',
  })
  @ApiResponse({
    status: 200,
    description: 'The access token has been successfully refreshed.',
    type: GetTokenDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts. Please try again later.',
  })
  @ApiGetErrorsResponse()
  @Serialize(GetTokenDto)
  refresh(@User() user: any) {
    const { refreshToken, email } = user;

    return this.authService.refresh(email, refreshToken);
  }

  @Get('get-user')
  @ApiOperation({
    summary: 'Get current user info',
    description: 'Get current logged in user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the current logged in user information.',
    type: GetUserResDto,
  })
  @Serialize(GetUserResDto)
  @ApiGetErrorsResponse()
  getUser(@User('id') userId: number): Promise<GetUserResDto> {
    return this.authService.getUser(userId);
  }
}
