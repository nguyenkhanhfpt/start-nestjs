import { IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';
import { UserEntity } from '@database/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  public static readonly resource = UserEntity.name;

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email of the user',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password of the user',
    type: String,
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}
