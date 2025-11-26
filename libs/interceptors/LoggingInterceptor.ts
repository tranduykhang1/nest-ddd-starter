import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';

import { RequestStorage } from 'libs/RequestStorage';

export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<object>,
  ): Observable<object> | Promise<Observable<object>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const logEntry = {
          timestamp: new Date().toISOString(),
          level: 'info',
          context: 'HTTP',
          requestId: RequestStorage.getStorage().requestId,
          userAgent: request.header('user-agent'),
          request: {
            method: request.method,
            url: request.url,
            body: request.body,
          },
          response: {
            statusCode: response.statusCode,
            duration: `${Date.now() - startTime}ms`,
          },
        };

        console.log(JSON.stringify(logEntry));
        return data;
      }),
    );
  }
}
