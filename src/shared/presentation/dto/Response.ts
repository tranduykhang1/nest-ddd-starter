export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
}

export class ResponseBuilder {
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static success<T>(data: T, status = 200, message?: string): ApiResponse<T> {
    return {
      status,
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error<T = null>(
    message: string,
    error: string,
    data: T = null as T,
    status = 500,
    path?: string,
  ): ApiResponse<T> {
    return {
      status,
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
    };
  }
}
