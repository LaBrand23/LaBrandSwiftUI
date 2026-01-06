/**
 * Base class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 400, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends ApiError {
  constructor(message: string = "Internal server error") {
    super(message, 500, false);
  }
}

