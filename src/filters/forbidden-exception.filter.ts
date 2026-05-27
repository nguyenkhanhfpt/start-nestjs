import { LoggerService } from '@modules/logger/logger.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { errorCodeConstant } from '@shared/constants/error-code.constant';
import { BaseErrorDto } from '@shared/dtos/base-error.dto';
import { t } from '@shared/utils';
import type { Response } from 'express';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter<HttpException> {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.FORBIDDEN;
    const code = errorCodeConstant.forbidden;
    const message = t(`error.${code}`) || exception.message;
    const error: BaseErrorDto = {
      code,
      message,
    };

    exception.message = message;
    this.loggerService.logErrorDetail(exception, code, request);
    response.status(status).json(error);
  }
}
