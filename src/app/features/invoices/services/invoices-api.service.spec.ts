import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InvoicesApiService } from './invoices-api.service';
import { Invoice } from '../models/invoice.model';
import { InvoiceStatus } from '../models/invoice-status.enum';
import { InvoiceFrequency } from '../models/invoice-frequency.enum';
import { ApiResponse } from '../../../core/models/api-response';

describe('InvoicesApiService', () => {
  let service: InvoicesApiService;
  let httpMock: HttpTestingController;

  const mockInvoice: Invoice = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    accountId: '123e4567-e89b-12d3-a456-426614174000',
    invoiceNumber: 'INV-2026-001',
    billingPeriodStart: '2026-01-01',
    billingPeriodEnd: '2026-01-31',
    frequency: InvoiceFrequency.Monthly,
    subtotalCents: 250000,
    taxCents: 22500,
    totalCents: 272500,
    status: InvoiceStatus.Issued,
    dueDate: '2026-02-15',
    issuedAt: '2026-02-01T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InvoicesApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(InvoicesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getInvoices', () => {
    it('should fetch invoices list', (done) => {
      const mockResponse: ApiResponse<Invoice> = {
        data: [mockInvoice],
        pagination: {
          page: 1,
          pageSize: 50,
          totalItems: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };

      service.getInvoices(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010'
      ).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0]).toEqual(mockInvoice);
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
      service.getInvoices(
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

    it('should include status filter parameter', (done) => {
      service.getInvoices(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        InvoiceStatus.Paid
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => req.params.get('status') === 'Paid'
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should include frequency filter parameter', (done) => {
      service.getInvoices(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        undefined,
        InvoiceFrequency.Monthly
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => req.params.get('frequency') === 'Monthly'
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should include sorting parameters', (done) => {
      service.getInvoices(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        undefined,
        undefined,
        'totalCents',
        'desc'
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => req.params.get('sortBy') === 'totalCents' && req.params.get('sortOrder') === 'desc'
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should combine multiple filters and sorting', (done) => {
      service.getInvoices(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        1,
        50,
        InvoiceStatus.Issued,
        InvoiceFrequency.Weekly,
        'dueDate',
        'asc'
      ).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        req => {
          return req.params.get('status') === 'Issued' &&
                 req.params.get('frequency') === 'Weekly' &&
                 req.params.get('sortBy') === 'dueDate' &&
                 req.params.get('sortOrder') === 'asc';
        }
      );
      req.flush({
        data: [],
        pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
      });
    });

    it('should handle errors', (done) => {
      service.getInvoices(
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

    it('should retry failed requests', (done) => {
      let requestCount = 0;

      service.getInvoices(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010'
      ).subscribe({
        error: () => {
          expect(requestCount).toBe(3); // Initial + 2 retries
          done();
        }
      });

      // Handle all retry attempts
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(req => req.url.includes('/api/tenants/'));
        requestCount++;
        req.flush('Error', { status: 500, statusText: 'Server Error' });
      }
    });
  });

  describe('getInvoice', () => {
    const mockInvoiceWithLineItems: Invoice = {
      ...mockInvoice,
      lineItems: [
        {
          id: 'line-001',
          rideId: 'ride-001',
          rideDate: '2026-01-15T10:30:00Z',
          fareCents: 125000,
          description: 'Pickup: 123 Main St | Dropoff: 456 Oak Ave'
        },
        {
          id: 'line-002',
          rideId: 'ride-002',
          rideDate: '2026-01-20T14:45:00Z',
          fareCents: 125000,
          description: 'Pickup: 789 Elm St | Dropoff: 321 Pine St'
        }
      ]
    };

    it('should fetch a single invoice by ID', (done) => {
      const mockResponse = { data: mockInvoiceWithLineItems };

      service.getInvoice(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001'
      ).subscribe(response => {
        expect(response.data).toEqual(mockInvoiceWithLineItems);
        expect(response.data.lineItems.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(
        '/api/tenants/123e4567-e89b-12d3-a456-426614174000/accounts/123e4567-e89b-12d3-a456-426614174010/invoices/123e4567-e89b-12d3-a456-426614174001'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include line items in invoice response', (done) => {
      const mockResponse = { data: mockInvoiceWithLineItems };

      service.getInvoice(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001'
      ).subscribe(response => {
        expect(response.data.lineItems).toBeDefined();
        expect(response.data.lineItems[0].rideId).toBe('ride-001');
        expect(response.data.lineItems[0].fareCents).toBe(125000);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/invoices/'));
      req.flush(mockResponse);
    });

    it('should handle 404 error for non-existent invoice', (done) => {
      service.getInvoice(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        'non-existent-id'
      ).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/invoices/non-existent-id'));
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should retry failed requests', (done) => {
      let requestCount = 0;

      service.getInvoice(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001'
      ).subscribe({
        error: () => {
          expect(requestCount).toBe(3); // Initial + 2 retries
          done();
        }
      });

      // Handle all retry attempts
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(req => req.url.includes('/invoices/'));
        requestCount++;
        req.flush('Error', { status: 500, statusText: 'Server Error' });
      }
    });
  });

  describe('updateInvoiceMetadata', () => {
    const metadata = {
      notes: 'Updated notes',
      internalReference: 'REF-002',
      billingContact: 'updated@example.com'
    };

    it('should update invoice metadata', (done) => {
      const mockResponse = {
        data: {
          ...mockInvoiceWithLineItems,
          ...metadata,
          updatedAt: '2026-02-02T00:00:00Z'
        }
      };

      service.updateInvoiceMetadata(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001',
        metadata
      ).subscribe(response => {
        expect(response.data.notes).toBe('Updated notes');
        expect(response.data.internalReference).toBe('REF-002');
        expect(response.data.billingContact).toBe('updated@example.com');
        expect(response.data.updatedAt).toBe('2026-02-02T00:00:00Z');
        done();
      });

      const req = httpMock.expectOne(
        '/api/tenants/123e4567-e89b-12d3-a456-426614174000/accounts/123e4567-e89b-12d3-a456-426614174010/invoices/123e4567-e89b-12d3-a456-426614174001/metadata'
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(metadata);
      req.flush(mockResponse);
    });

    it('should handle server errors', (done) => {
      service.updateInvoiceMetadata(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001',
        metadata
      ).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(req => req.url.includes('/metadata'));
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should retry failed requests', (done) => {
      let requestCount = 0;

      service.updateInvoiceMetadata(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001',
        metadata
      ).subscribe({
        error: () => {
          expect(requestCount).toBe(3); // Initial + 2 retries
          done();
        }
      });

      // Handle all retry attempts
      for (let i = 0; i < 3; i++) {
        const req = httpMock.expectOne(req => req.url.includes('/metadata'));
        requestCount++;
        req.flush('Error', { status: 500, statusText: 'Server Error' });
      }
    });

    it('should handle partial metadata updates', (done) => {
      const partialMetadata = { notes: 'Only notes updated' };

      service.updateInvoiceMetadata(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174001',
        partialMetadata
      ).subscribe(response => {
        expect(response.data).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/metadata'));
      expect(req.request.body).toEqual(partialMetadata);
      req.flush({ data: mockInvoiceWithLineItems });
    });
  });
});
