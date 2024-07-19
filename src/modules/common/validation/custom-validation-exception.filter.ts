import {
  ExceptionFilter,
  Catch,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

@Catch(BadRequestException)
export class CustomGraphQLValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException) {
    const status = HttpStatus.BAD_REQUEST;
    const responseBody = exception.getResponse() as
      | { message: any; statusCode: number }
      | { message: any[]; statusCode: number; error: string };

    if (Array.isArray(responseBody.message)) {
      const validationErrors = responseBody.message.map((msg: string) => {
        const [field, error] = msg.split(' ');

        return {
          field: field.toLowerCase(),
          errors: [msg],
        };
      });

      throw new BadRequestException({
        statusCode: status,
        message: validationErrors,
      });
    } else {
      throw new BadRequestException(responseBody);
    }
  }
}
