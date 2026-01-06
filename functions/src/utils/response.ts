import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";
import { ResponseCodes } from "../config/constants";

/**
 * Send a success response
 */
export function success<T>(res: Response, data: T, message?: string): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(ResponseCodes.SUCCESS).json(response);
}

/**
 * Send a created response (201)
 */
export function created<T>(res: Response, data: T, message?: string): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message: message || "Created successfully",
  };
  return res.status(ResponseCodes.CREATED).json(response);
}

/**
 * Send a paginated response
 */
export function paginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
  return res.status(ResponseCodes.SUCCESS).json(response);
}

/**
 * Send an error response
 */
export function error(
  res: Response,
  message: string,
  statusCode: number = ResponseCodes.BAD_REQUEST
): Response {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send unauthorized response
 */
export function unauthorized(res: Response, message: string = "Unauthorized"): Response {
  return error(res, message, ResponseCodes.UNAUTHORIZED);
}

/**
 * Send forbidden response
 */
export function forbidden(res: Response, message: string = "Access denied"): Response {
  return error(res, message, ResponseCodes.FORBIDDEN);
}

/**
 * Send not found response
 */
export function notFound(res: Response, message: string = "Resource not found"): Response {
  return error(res, message, ResponseCodes.NOT_FOUND);
}

/**
 * Send internal server error response
 */
export function serverError(res: Response, message: string = "Internal server error"): Response {
  return error(res, message, ResponseCodes.INTERNAL_ERROR);
}

