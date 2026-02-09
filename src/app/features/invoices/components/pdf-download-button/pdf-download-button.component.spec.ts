import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PdfDownloadButtonComponent } from './pdf-download-button.component';
import { PdfDownloadService } from '../../services/pdf-download.service';
import { TenantService } from '../../../../core/services/tenant.service';

describe('PdfDownloadButtonComponent', () => {
  let component: PdfDownloadButtonComponent;
  let fixture: ComponentFixture<PdfDownloadButtonComponent>;
  let mockPdfDownloadService: jasmine.SpyObj<PdfDownloadService>;
  let mockTenantService: jasmine.SpyObj<TenantService>;

  beforeEach(async () => {
    mockPdfDownloadService = jasmine.createSpyObj('PdfDownloadService', ['downloadInvoicePdf']);
    mockTenantService = jasmine.createSpyObj('TenantService', [], {
      currentTenantId: jasmine.createSpy().and.returnValue('tenant-123')
    });

    await TestBed.configureTestingModule({
      imports: [PdfDownloadButtonComponent],
      providers: [
        { provide: PdfDownloadService, useValue: mockPdfDownloadService },
        { provide: TenantService, useValue: mockTenantService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfDownloadButtonComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.tenantId = 'tenant-123';
    component.accountId = 'account-123';
    component.invoiceId = 'invoice-123';
    component.invoiceNumber = 'INV-2026-001';
    component.issuedAt = '2026-02-01T00:00:00Z';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display download button', () => {
    const button = fixture.nativeElement.querySelector('[data-testid="download-pdf-button"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Download PDF');
  });

  it('should call PDF download service when button clicked', () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    mockPdfDownloadService.downloadInvoicePdf.and.returnValue(of(mockBlob));

    component.downloadPdf();

    expect(mockPdfDownloadService.downloadInvoicePdf).toHaveBeenCalledWith(
      'tenant-123',
      'account-123',
      'invoice-123',
      'INV-2026-001',
      '2026-02-01T00:00:00Z'
    );
  });

  it('should show loading state during download', () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    mockPdfDownloadService.downloadInvoicePdf.and.returnValue(of(mockBlob));

    component.downloadPdf();
    
    expect(component.downloading()).toBe(true);
  });

  it('should disable button during download', () => {
    component.downloading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="download-pdf-button"]');
    expect(button.disabled).toBe(true);
  });

  it('should display "Generating..." text during download', () => {
    component.downloading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="download-pdf-button"]');
    expect(button.textContent).toContain('Generating');
  });

  it('should clear loading state after successful download', (done) => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    mockPdfDownloadService.downloadInvoicePdf.and.returnValue(of(mockBlob));

    component.downloadPdf();

    setTimeout(() => {
      expect(component.downloading()).toBe(false);
      done();
    }, 100);
  });

  it('should handle download errors', (done) => {
    mockPdfDownloadService.downloadInvoicePdf.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.downloadPdf();

    setTimeout(() => {
      expect(component.error()).toBe('Failed to generate PDF. Please try again.');
      expect(component.downloading()).toBe(false);
      done();
    }, 100);
  });

  it('should display error message', () => {
    component.error.set('Test error message');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('[data-testid="pdf-error-message"]');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Test error message');
  });

  it('should handle 404 error with specific message', (done) => {
    mockPdfDownloadService.downloadInvoicePdf.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    component.downloadPdf();

    setTimeout(() => {
      expect(component.error()).toBe('Invoice not found');
      done();
    }, 100);
  });

  it('should clear error when clearError called', () => {
    component.error.set('Test error');
    
    component.clearError();
    
    expect(component.error()).toBeNull();
  });

  it('should prevent multiple concurrent downloads', () => {
    const mockBlob = new Blob(['mock pdf'], { type: 'application/pdf' });
    mockPdfDownloadService.downloadInvoicePdf.and.returnValue(of(mockBlob));

    component.downloading.set(true);
    component.downloadPdf();

    expect(mockPdfDownloadService.downloadInvoicePdf).not.toHaveBeenCalled();
  });
});
