import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ValidateConstant } from '@shared/constants/validate.constant';

// It extends the CreateUserDto and makes all fields optional using PartialType.
// email and username are redeclared without IsExistEmail/IsExistUsername since those
// validators would reject a user's own current value; UsersService.update() checks
// uniqueness itself, only when the value actually changes.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'username'] as const),
) {
  @ApiPropertyOptional({
    description: 'Unique username (letters, numbers, underscores)',
    example: 'john_doe',
  })
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @Matches(ValidateConstant.REGEX_USERNAME, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
