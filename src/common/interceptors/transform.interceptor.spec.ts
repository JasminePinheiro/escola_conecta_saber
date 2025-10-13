import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformInterceptor();

    mockExecutionContext = {} as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response data in standard format', (done) => {
    const testData = { name: 'Test', value: 123 };
    mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('data', testData);
        expect(result).toHaveProperty('timestamp');
        expect(result.data).toEqual(testData);
        done();
      },
    });
  });

  it('should add timestamp in ISO format', (done) => {
    const testData = { test: 'data' };
    mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.timestamp).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        );
        done();
      },
    });
  });

  it('should set success to true', (done) => {
    const testData = { test: 'data' };
    mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.success).toBe(true);
        done();
      },
    });
  });

  it('should handle null data', (done) => {
    mockCallHandler.handle = jest.fn().mockReturnValue(of(null));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (result) => {
        expect(result.success).toBe(true);
        expect(result.data).toBeNull();
        done();
      },
    });
  });
});
