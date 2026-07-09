import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsExistEmail, IsExistUsername } from '@shared/validators';
import { UserEntity } from '@database/entities/user.entity';
import { ValidateConstant } from '@shared/constants/validate.constant';

export class CreateUserDto {
  public static resource = UserEntity.name;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Unique username (letters, numbers, underscores)',
    example: 'john_doe',
  })
  @IsExistUsername()
  @Matches(ValidateConstant.REGEX_USERNAME, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsExistEmail()
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password (min 8 chars, must include upper, lower, number)',
    example: 'P@ssw0rd',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Avatar filename',
    example: 'avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Short bio',
    example: 'Software engineer based in Vietnam',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+84912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+\d\s\-().]+$/, { message: 'Invalid phone number format' })
  phone?: string;
}
