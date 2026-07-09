import { LoggerService } from '@modules/logger/logger.service';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { errorCodeConstant } from '@shared/constants/error-code.constant';
import { BadRequestErrorDto } from '@shared/dtos/bad-request-error.dto';
import { t } from '@shared/utils';
import { isArray, isEmpty, ValidationError } from 'class-validator';
import { camelCase } from 'lodash';

import { IExceptionRes, ITargetConstructor } from './filters.type';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  /**
   * Logger
   * @param loggerService
   */
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const exceptionRes = exception.getResponse() as
      | IExceptionRes
      | BadRequestErrorDto;
    let errors: BadRequestErrorDto[] = [];
    const messages = exceptionRes?.message as ValidationError[];

    if (isArray(messages)) {
      if (messages.some((msg) => msg instanceof ValidationError)) {
        errors = this.buildErrorMessage(messages);
      } else {
        errors = this.buildErrorCustomMessage(
          messages as unknown as BadRequestErrorDto[],
        );
      }
    } else if (messages) {
      const { code } = exceptionRes as BadRequestErrorDto;

      errors.push({
        resource: undefined,
        field: undefined,
        code,
        message:
          typeof messages === 'string' ? messages : JSON.stringify(messages),
      });
    } else {
      const { resource, field, code } = exceptionRes as BadRequestErrorDto;
      const validation = exceptionRes['validation'];
      errors.push({
        resource,
        field,
        code,
        message: t(`error.${camelCase(resource)}.${field}.${validation}`),
      });
    }

    for (const error of errors) {
      exception.message = error.message;

      this.loggerService.logErrorDetail(exception, error.code);
    }

    response.status(HttpStatus.BAD_REQUEST).json(errors);
  }

  /**
   * Build error message
   *
   * @param {ValidationError[]} validationErrors
   * @param {string} parent
   * @param {string} index
   *
   * @returns {BadRequestErrorDto[]}
   */
  private buildErrorMessage(
    validationErrors: ValidationError[],
    parent?: string,
    index?: string | null,
  ): BadRequestErrorDto[] {
    const errors: BadRequestErrorDto[] = [];

    errors.push(
      ...validationErrors.reduce(
        (arr, { children, constraints, target, property }) => {
          if (!constraints && children && !isEmpty(children)) {
            const nestedErrors = this.buildErrorMessage(
              children,
              parent || property,
              Array.isArray(target) ? property : null,
            );
            arr.push(...nestedErrors);
          } else {
            const validation = Object.keys(constraints)[0];
            const { resource } =
              target?.constructor as unknown as ITargetConstructor;
            const code =
              errorCodeConstant[`${camelCase(resource)}`]?.[`${property}`]?.[
                `${validation}`
              ];
            const message = t(
              `error.${camelCase(resource)}.${property}.${validation}`,
            );

            arr.push({
              resource,
              field: property,
              code,
              message,
              ...(parent && { parent }),
              ...(index && { index }),
            });
          }

          return arr;
        },
        [],
      ),
    );

    return errors;
  }

  /**
   *  Custom message
   *
   * @param {BadRequestErrorDto[]} validationErrors
   * @returns {BadRequestErrorDto[]}
   */
  private buildErrorCustomMessage(validationErrors: BadRequestErrorDto[]) {
    const errors: BadRequestErrorDto[] = [];

    for (const error of validationErrors) {
      const { resource, field, code } = error;
      const validation = error['validation'];

      errors.push({
        resource,
        field,
        code,
        message: t(`error.${camelCase(resource)}.${field}.${validation}`),
      });
    }

    return errors;
  }
}
