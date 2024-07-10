import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExecutionContext } from '@nestjs/graphql';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    console.log(2222);

    const ctx = GqlExecutionContext.create(gqlHost).getContext(); // Retrieve GraphQL context
    console.log(1111111);
    const response = ctx.res; // Access response from GraphQL context

    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.getResponse(),
    });
  }
}
