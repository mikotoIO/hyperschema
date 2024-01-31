import { BaseError } from '../../errors';

export function processError(err: unknown) {
  if (err instanceof BaseError) {
    return {
      message: err.message,
      code: err.code,
    };
  }
  if (err instanceof Error) {
    return {
      message: err.message,
    };
  }
  return { message: 'Unknown Error' };
}
