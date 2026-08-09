import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role } from '@shared/enums/role.enum';

export class UserItemDto {
  @ApiProperty({ example: 1, description: 'User ID', type: Number })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'abc@gmail.com',
    description: 'Email address of the user',
    type: String,
  })
  @Expose()
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Role of the user',
  })
  @Expose()
  role: Role;
}

export class GetUserResDto extends UserItemDto {}
