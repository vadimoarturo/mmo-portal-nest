import { InvalidCredentials } from '#Root/shared/domain/invalid-credentials';
import { ErrorCodeClient } from '#Root/shared/domain/enum/error-code.enum';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '#Root/shared/domain/domain-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const http = host.switchToHttp();
        const response = http.getResponse<Response>();
        const request = http.getRequest<Request>();
        if (exception instanceof InvalidCredentials) {
            response.status(401).json({ statusCode: 401, message: 'Unauthorized' });
            return;
        }
        if (exception instanceof DomainError && exception.type === 'CLIENT') {
            response.status(HttpStatus.BAD_REQUEST).json({ statusCode: HttpStatus.BAD_REQUEST, ...exception.toJSON() });
            return;
        }
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const detail = exception.getResponse();
            response.status(status).json({
                statusCode: status,
                ...(typeof detail === 'object' ? detail : { message: detail }),
                ...(status === 400 ? { code: ErrorCodeClient.ERROR_DTO_VALIDATION } : {}),
            });
            return;
        }
        // Database errors can contain SQL, connection details, or user data; keep them out of public responses and logs.
        this.logger.error(`${request.method} ${request.path}: ${exception instanceof Error ? exception.name : 'UnknownError'}`);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ statusCode: 500, message: 'Internal Server Error' });
    }
}
