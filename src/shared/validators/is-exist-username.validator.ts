import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { ValidateConstant } from '@shared/constants/validate.constant';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const IS_EXIST_USERNAME = 'isExistUsername';

@ValidatorConstraint({ name: IS_EXIST_USERNAME, async: true })
@Injectable()
export class IsExistUsernameValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async validate(value: any, args: ValidationArguments) {
    if (!value || !ValidateConstant.REGEX_USERNAME.test(value)) {
      return false;
    }

    return !(await this.usersService.findOneBy(
      {
        username: value,
      },
      ['id'],
    ));
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  defaultMessage(args: ValidationArguments) {
    // TODO
    return 'Username $value is already exist';
  }
}

export function IsExistUsername(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistUsernameValidator,
    });
  };
}
