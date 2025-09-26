import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import {Response} from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        const status = exception.getStatus();

        this.logger.error(
          `HTTP ${status} Error on ${request.method} ${request.url} - ${exception.message}`
        );

        response
            .status(exception.getStatus())
            .json(exception.getResponse());
    }
}