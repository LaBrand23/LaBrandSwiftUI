import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { error } from "../utils/response";

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        error(res, `Validation error: ${messages.join(", ")}`, 400);
        return;
      }
      error(res, "Invalid request body", 400);
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        error(res, `Query validation error: ${messages.join(", ")}`, 400);
        return;
      }
      error(res, "Invalid query parameters", 400);
    }
  };
}

/**
 * Validate URL parameters against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        error(res, `Parameter validation error: ${messages.join(", ")}`, 400);
        return;
      }
      error(res, "Invalid URL parameters", 400);
    }
  };
}

// Common validation schemas
export const uuidParam = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const paginationQuery = z.object({
  page: z.string().optional().transform((val) => parseInt(val || "1", 10)),
  limit: z.string().optional().transform((val) => parseInt(val || "20", 10)),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

