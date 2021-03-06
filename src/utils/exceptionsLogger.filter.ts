import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
class ExceptionsLoggerFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log('Exception throw', exception);
    super.catch(exception, host);
  }
}

export default ExceptionsLoggerFilter;
