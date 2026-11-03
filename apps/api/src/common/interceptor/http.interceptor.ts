import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
    private readonly logger = new Logger(HttpInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const response = http.getResponse();
        const started = Date.now();
        return next.handle().pipe(
            finalize(() => {
                // Request bodies, query strings, cookies, and responses may contain credentials.
                this.logger.log(`${request.method} ${request.path} ${response.statusCode} ${Date.now() - started}ms`);
            }),
        );
    }
}
