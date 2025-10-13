import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          url: '/test',
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log before and after successful request', (done) => {
    const debugSpy = jest.spyOn(interceptor['logger'], 'debug');
    mockCallHandler.handle = jest.fn().mockReturnValue(of({ data: 'test' }));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('Iniciando:'),
        );
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringContaining('Concluído:'),
        );
        done();
      },
    });
  });

  it('should log error when request fails', (done) => {
    const errorSpy = jest.spyOn(interceptor['logger'], 'error');
    const testError = new Error('Test error');
    mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => testError));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      error: () => {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Erro:'),
        );
        done();
      },
    });
  });

  it('should measure request duration', (done) => {
    const debugSpy = jest.spyOn(interceptor['logger'], 'debug');
    mockCallHandler.handle = jest.fn().mockReturnValue(of({ data: 'test' }));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: () => {
        expect(debugSpy).toHaveBeenCalledWith(
          expect.stringMatching(/\d+ms/),
        );
        done();
      },
    });
  });
});

