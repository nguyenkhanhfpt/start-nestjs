import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// It extends the CreateUserDto and makes all fields optional using PartialType.
// @IsExistEmail in email will be ignored in this DTO, so we can update email without checking if it exists or not.
export class UpdateUserDto extends PartialType(CreateUserDto) {}
