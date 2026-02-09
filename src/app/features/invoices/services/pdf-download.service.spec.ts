import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PdfDownloadService } from './pdf-download.service';

describe('PdfDownloadService', () => {
  let service: PdfDownloadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PdfDownloadService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PdfDownloadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request PDF from correct endpoint', (done) => {
    const mockPdfBlob = new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' });

    service.downloadInvoicePdf(
      'tenant-123',
      'account-123',
      'invoice-123',
      'INV-2026-001',
      '2026-02-01T00:00:00Z'
    ).subscribe({
      next: () => {
        done();
      }
    });

    const req = httpMock.expectOne(
      '/api/tenants/tenant-123/accounts/account-123/invoices/invoice-123/pdf'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    
    req.flush(mockPdfBlob);
  });

  it('should handle PDF download errors', (done) => {
    service.downloadInvoicePdf(
      'tenant-123',
      'account-123',
      'invoice-123',
      'INV-2026-001',
      '2026-02-01T00:00:00Z'
    ).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.status).toBe(500);
        done();
      }
    });

    const req = httpMock.expectOne(req => req.url.includes('/pdf'));
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle 404 errors', (done) => {
    service.downloadInvoicePdf(
      'tenant-123',
      'account-123',
      'non-existent',
      'INV-2026-001',
      '2026-02-01T00:00:00Z'
    ).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.status).toBe(404);
        done();
      }
    });

    const req = httpMock.expectOne(req => req.url.includes('/pdf'));
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should sanitize invoice number in filename', () => {
    // Access private method through type assertion for testing
    const sanitized = (service as any).sanitizeFilename('INV/2026\\001');
    expect(sanitized).toBe('INV-2026-001');
  });

  it('should sanitize special characters in filename', () => {
    const sanitized = (service as any).sanitizeFilename('INV<2026>:001');
    expect(sanitized).toBe('INV_2026__001');
  });

  it('should generate filename from invoice data', () => {
    const filename = (service as any).generateFilename(
      'INV-2026-001',
      '2026-02-01T10:30:00Z',
      null
    );
    expect(filename).toBe('INV-2026-001_2026-02-01.pdf');
  });

  it('should extract filename from Content-Disposition header', () => {
    const filename = (service as any).generateFilename(
      'INV-2026-001',
      '2026-02-01T10:30:00Z',
      'attachment; filename="Custom-Filename.pdf"'
    );
    expect(filename).toBe('Custom-Filename.pdf');
  });

  it('should fallback to generated filename if Content-Disposition invalid', () => {
    const filename = (service as any).generateFilename(
      'INV-2026-001',
      '2026-02-01T10:30:00Z',
      'attachment; invalid-header'
    );
    expect(filename).toBe('INV-2026-001_2026-02-01.pdf');
  });

  it('should extract date from ISO 8601 timestamp', () => {
    const filename = (service as any).generateFilename(
      'INV-2026-042',
      '2026-02-15T14:30:00Z',
      null
    );
    expect(filename).toContain('2026-02-15');
  });
});
