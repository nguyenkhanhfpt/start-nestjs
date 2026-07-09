import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserEntity } from '@database/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsExistEmail, IsExistUsername } from '@shared/validators';
import { ValidateConstant } from '@shared/constants/validate.constant';

export class RegisterDto {
  public static resource = UserEntity.name;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
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

  @ApiProperty({
    description: 'Email of the user',
    example: 'abc@gmail.com',
  })
  @IsExistEmail()
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
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
}
