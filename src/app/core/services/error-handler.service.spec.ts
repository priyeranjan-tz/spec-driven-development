import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalErrorHandler } from './error-handler.service';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler]
    });
    errorHandler = TestBed.inject(GlobalErrorHandler);
    consoleErrorSpy = spyOn(console, 'error');
  });

  describe('handleError', () => {
    it('should handle HTTP errors', () => {
      const httpError = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
        url: '/api/test'
      });

      errorHandler.handleError(httpError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error detected by GlobalErrorHandler:',
        jasmine.objectContaining({
          status: 500,
          message: jasmine.stringContaining('500'),
          url: '/api/test'
        })
      );
    });

    it('should handle client-side errors', () => {
      const clientError = new Error('Test client error');

      errorHandler.handleError(clientError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Client-side error detected by GlobalErrorHandler:',
        jasmine.objectContaining({
          message: 'Test client error',
          stack: jasmine.any(String)
        })
      );
    });

    it('should log 401 errors', () => {
      const unauthorizedError = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: '/api/accounts'
      });

      errorHandler.handleError(unauthorizedError);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log 404 errors', () => {
      const notFoundError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/accounts/999'
      });

      errorHandler.handleError(notFoundError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error detected by GlobalErrorHandler:',
        jasmine.objectContaining({
          status: 404
        })
      );
    });

    it('should not crash on null errors', () => {
      expect(() => {
        errorHandler.handleError(null as any);
      }).not.toThrow();
    });
  });
});
