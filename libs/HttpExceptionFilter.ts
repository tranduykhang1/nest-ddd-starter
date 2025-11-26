import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../src/shared/presentation/dto/Response';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ExceptionCode,
} from '../src/shared/exceptions/DomainException';
import { ValidationException } from '../src/shared/exceptions/ValidationException';
import { ExceptionBase } from '../src/shared/exceptions/ExceptionBase';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Map exception codes to HTTP status codes
 */
const CODE_TO_HTTP_STATUS: Record<string, HttpStatus> = {
  // Not Found - 404
  [ExceptionCode.ENTITY_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ExceptionCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,

  // Conflict - 409
  [ExceptionCode.ENTITY_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ExceptionCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ExceptionCode.AGGREGATE_VERSION_CONFLICT]: HttpStatus.CONFLICT,

  // Unauthorized - 401
  [ExceptionCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ExceptionCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [ExceptionCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,

  // Bad Request - 400
  [ExceptionCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [ExceptionCode.INVALID_EMAIL]: HttpStatus.BAD_REQUEST,
  [ExceptionCode.INVALID_PASSWORD]: HttpStatus.BAD_REQUEST,
  [ExceptionCode.INVALID_NAME]: HttpStatus.BAD_REQUEST,
  [ExceptionCode.INVALID_OPERATION]: HttpStatus.BAD_REQUEST,
};

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter<HttpException | Error>
{
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(
    exception: HttpException | Error,
    host: ArgumentsHost,
  ): Response<ErrorResponse, Record<string, string>> {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    this.logger.error({
      message: exception.message,
      stack: exception.stack,
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
      },
    });

    // Handle our custom exceptions
    if (exception instanceof ExceptionBase) {
      const status = this.getHttpStatus(exception);

      const errorResponse: ApiResponse<unknown> = {
        status,
        success: false,
        message: exception.message,
        error: exception.constructor.name,
        code: exception.code,
        details: exception.details,
        timestamp,
        path,
      };

      // Add validation errors if present
      if (
        exception instanceof ValidationException &&
        'errors' in exception
      ) {
        (errorResponse as any).errors = exception.errors;
      }

      return response.status(status).json(errorResponse);
    }

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const errorResponse: ApiResponse<unknown> = {
        status,
        success: status < 400,
        message:
          typeof exceptionResponse === 'object' &&
          'message' in exceptionResponse
            ? (exceptionResponse as any).message
            : exception.message,
        error:
          typeof exceptionResponse === 'object' && 'error' in exceptionResponse
            ? (exceptionResponse as any).error
            : HttpStatus[status],
        timestamp,
        path,
      };

      return response.status(status).json(errorResponse);
    }

    // Handle unknown errors
    const errorResponse: ApiResponse<unknown> = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: exception.message || 'Internal server error',
      error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
      timestamp,
      path,
    };

    return response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }

  private getHttpStatus(exception: ExceptionBase): HttpStatus {
    // Check by exception type first
    if (exception instanceof NotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ConflictException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof UnauthorizedException) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (exception instanceof BadRequestException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof ValidationException) {
      return HttpStatus.BAD_REQUEST;
    }

    // Check by code
    const statusByCode = CODE_TO_HTTP_STATUS[exception.code];
    if (statusByCode) {
      return statusByCode;
    }

    // Default to 422 Unprocessable Entity
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
