import { NotFoundException } from '@nestjs/common';
import { errorCodeConstant } from '@shared/constants/error-code.constant';
import { t } from './app.util';

export const assertFound = <T>(
  entity: T | null | undefined,
  code: string = errorCodeConstant.notFound,
): T => {
  if (!entity) {
    throw new NotFoundException({ code, message: t(`error.${code}`) });
  }

  return entity;
};
