export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function success<T>(data: T, pagination?: PaginationMeta): Response {
  const body: SuccessResponse<T> = { success: true, data };
  if (pagination) {
    body.pagination = pagination;
  }
  return Response.json(body, { status: 200 });
}

export function created<T>(data: T): Response {
  return Response.json({ success: true, data } as SuccessResponse<T>, {
    status: 201,
  });
}

export function error(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>,
): Response {
  const body: ErrorResponse = { success: false, message };
  if (errors) {
    body.errors = errors;
  }
  return Response.json(body, { status });
}

export function unauthorized(): Response {
  return error("Unauthorized", 401);
}

export function forbidden(): Response {
  return error("Forbidden", 403);
}

export function notFound(): Response {
  return error("Not found", 404);
}

export function conflict(message: string = "Conflict"): Response {
  return error(message, 409);
}

export function validationError(errors: Record<string, string[]>): Response {
  return error("Validation error", 400, errors);
}

export function internalError(): Response {
  return error("Internal server error", 500);
}
