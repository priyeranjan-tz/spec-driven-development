import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AccountsApiService } from './accounts-api.service';
import { Account } from '../models/account.model';
import { AccountType } from '../models/account-type.enum';
import { AccountStatus } from '../models/account-status.enum';
import { ApiResponse, SingleApiResponse } from '../../../core/models/api-response';

describe('AccountsApiService', () => {
  let service: AccountsApiService;
  let httpMock: HttpTestingController;

  const mockAccount: Account = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    name: 'General Hospital',
    type: AccountType.Organization,
    currentBalance: 125050,
    lastInvoiceDate: '2026-01-15',
    status: AccountStatus.Active,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountsApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AccountsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAccounts', () => {
    it('should fetch accounts list', (done) => {
      const mockResponse: ApiResponse<Account> = {
        data: [mockAccount],
        pagination: {
          page: 1,
          pageSize: 50,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };

      service.getAccounts('123e4567-e89b-12d3-a456-426614174000').subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0]).toEqual(mockAccount);
        expect(response.pagination.totalItems).toBe(1);
        done();
      });

      const req = httpMock.expectOne(
        req => req.url.includes('/api/tenants/123e4567-e89b-12d3-a456-426614174000/accounts')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include query parameters', (done) => {
      service.getAccounts(
        '123e4567-e89b-12d3-a456-426614174000',
        2,
        100,
        AccountStatus.Active,
        AccountType.Organization
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => {
          return req.url.includes('/api/tenants/') &&
                 req.params.get('page') === '2' &&
                 req.params.get('pageSize') === '100' &&
                 req.params.get('status') === 'active' &&
                 req.params.get('type') === 'organization';
        }
      );
      req.flush({
        data: [],
        pagination: { page: 2, pageSize: 100, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should handle errors', (done) => {
      service.getAccounts('123e4567-e89b-12d3-a456-426614174000').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/api/tenants/'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getAccount', () => {
    it('should fetch single account', (done) => {
      const mockResponse: SingleApiResponse<Account> = {
        data: mockAccount
      };

      service.getAccount(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001'
      ).subscribe(account => {
        expect(account).toEqual(mockAccount);
        done();
      });

      const req = httpMock.expectOne(
        '/api/tenants/123e4567-e89b-12d3-a456-426614174000/accounts/123e4567-e89b-12d3-a456-426614174001'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error', (done) => {
      service.getAccount(
        '123e4567-e89b-12d3-a456-426614174000',
        'non-existent-id'
      ).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
         done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/accounts/non-existent-id'));
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
