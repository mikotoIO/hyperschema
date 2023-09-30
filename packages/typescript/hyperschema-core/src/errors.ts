export class BaseError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export class NotFoundError extends BaseError {
  constructor(message?: string) {
    super('NotFound', message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message?: string) {
    super('Unauthorized', message);
  }
}

export class ValidationError extends BaseError {
  constructor(message?: string) {
    super('ValidationError', message);
  }
}

export class ServerError extends BaseError {
  constructor(message?: string) {
    super('ServerError', message);
  }
}
