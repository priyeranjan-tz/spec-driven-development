import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TransactionsApiService } from './transactions-api.service';
import { LedgerEntry } from '../models/ledger-entry.model';
import { SourceType } from '../models/source-type.enum';
import { ApiResponse, SingleApiResponse } from '../../../core/models/api-response';

describe('TransactionsApiService', () => {
  let service: TransactionsApiService;
  let httpMock: HttpTestingController;

  const mockLedgerEntry: LedgerEntry = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    accountId: '123e4567-e89b-12d3-a456-426614174000',
    postingDate: '2026-02-05T10:30:00Z',
    sourceType: SourceType.Ride,
    sourceReferenceId: 'ride-123',
    debitAmount: 2500,
    creditAmount: 0,
    runningBalance: 2500,
    linkedInvoiceId: null,
    metadata: {},
    createdAt: '2026-02-05T10:30:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TransactionsApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TransactionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getLedgerEntries', () => {
    it('should fetch ledger entries list', (done) => {
      const mockResponse: ApiResponse<LedgerEntry> = {
        data: [mockLedgerEntry],
        pagination: {
          page: 1,
          pageSize: 50,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };

      service.getLedgerEntries(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010'
      ).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0]).toEqual(mockLedgerEntry);
        expect(response.pagination.totalItems).toBe(1);
        done();
      });

      const req = httpMock.expectOne(
        req => req.url.includes('/api/tenants/123e4567-e89b-12d3-a456-426614174000/accounts/')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include pagination query parameters', (done) => {
      service.getLedgerEntries(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        2,
        100
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => req.params.get('page') === '2' && req.params.get('pageSize') === '100'
      );
      req.flush({
        data: [],
        pagination: { page: 2, pageSize: 100, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should include date filter parameters', (done) => {
      service.getLedgerEntries(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        '2026-01-01',
        '2026-01-31'
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => req.params.get('startDate') === '2026-01-01' && req.params.get('endDate') === '2026-01-31'
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should include source type filter', (done) => {
      service.getLedgerEntries(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        undefined,
        undefined,
        SourceType.Ride
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => req.params.get('sourceType') === 'ride'
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should combine multiple filters', (done) => {
      service.getLedgerEntries(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        '2026-02-01',
        '2026-02-06',
        SourceType.Payment
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => {
          return req.params.get('startDate') === '2026-02-01' &&
                 req.params.get('endDate') === '2026-02-06' &&
                 req.params.get('sourceType') === 'payment';
        }
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should handle errors', (done) => {
      service.getLedgerEntries(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010'
      ).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/api/tenants/'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getLedgerEntry', () => {
    it('should fetch single ledger entry', (done) => {
      const mockResponse: SingleApiResponse<LedgerEntry> = {
        data: mockLedgerEntry
      };

      service.getLedgerEntry(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001'
      ).subscribe(entry => {
        expect(entry).toEqual(mockLedgerEntry);
        done();
      });

      const req = httpMock.expectOne(
        '/api/tenants/123e4567-e89b-12d3-a456-426614174000/accounts/123e4567-e89b-12d3-a456-426614174010/ledger/123e4567-e89b-12d3-a456-426614174001'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error', (done) => {
      service.getLedgerEntry(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        'non-existent-id'
      ).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/ledger/non-existent-id'));
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
