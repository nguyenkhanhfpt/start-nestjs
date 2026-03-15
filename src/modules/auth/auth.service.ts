import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from '@modules/auth/dtos/req/login.dto';
import { RegisterDto } from '@modules/auth/dtos/req/register.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { comparePassword, hashPassword } from '@shared/utils';
import { JwtPayload } from '@modules/auth/strategies/access-token.strategy';
import { GetTokenDto, LoginResDto } from './dtos/res/login-res.dto';
import { GetUserResDto } from './dtos/res';
import { plainToInstance } from 'class-transformer';

/**
 * Auth service
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login user
   * @param loginDto
   */
  async login(loginDto: LoginDto): Promise<LoginResDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'name', 'email', 'password'],
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordMatch = await comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.getTokens(user);

    return plainToInstance(
      LoginResDto,
      {
        ...tokens,
        user,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  /**
   * Register user
   * @param registerDto
   */
  async register(registerDto: RegisterDto): Promise<LoginResDto> {
    registerDto.password = await hashPassword(registerDto.password);
    const user = await this.userRepository.save(registerDto);

    const tokens = await this.getTokens(user);

    return plainToInstance(
      LoginResDto,
      {
        ...tokens,
        user,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  logout() {
    // TODO: Implement token blacklist mechanism
    return true;
  }

  /**
   * Refresh access token
   * @param email
   * @param refreshToken
   */
  async refresh(email: string, refreshToken: string): Promise<GetTokenDto> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    const { accessToken } = await this.getTokens(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate access and refresh tokens
   * @param user
   */
  async getTokens(user: UserEntity): Promise<GetTokenDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        } as JwtPayload,
        {
          secret: this.configService.get<string>('app.jwt.accessSecret'),
          expiresIn: this.configService.get<string>('app.jwt.accessExpiresIn'),
        },
      ),
      this.jwtService.signAsync(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        } as JwtPayload,
        {
          secret: this.configService.get<string>('app.jwt.refreshSecret'),
          expiresIn: this.configService.get<string>('app.jwt.refreshExpiresIn'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async getUser(id: number): Promise<GetUserResDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    return plainToInstance(GetUserResDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
