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

export const IS_EXIST_EMAIL = 'isExistEmail';

@ValidatorConstraint({ name: IS_EXIST_EMAIL, async: true })
@Injectable()
export class IsExistEmailValidator implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  async validate(value: any, args: ValidationArguments) {
    if (!value || !ValidateConstant.REGEX_EMAIL.test(value)) {
      return false;
    }

    return !(await this.usersService.existsBy({ email: value }));
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  defaultMessage(args: ValidationArguments) {
    // TODO
    return 'Email $value is already exist';
  }
}

export function IsExistEmail(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistEmailValidator,
    });
  };
}
