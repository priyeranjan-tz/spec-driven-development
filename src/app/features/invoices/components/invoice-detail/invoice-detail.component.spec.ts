import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InvoiceDetailComponent } from './invoice-detail.component';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Invoice } from '../../models/invoice.model';
import { InvoiceStatus } from '../../models/invoice-status.enum';
import { InvoiceFrequency } from '../../models/invoice-frequency.enum';

describe('InvoiceDetailComponent', () => {
  let component: InvoiceDetailComponent;
  let fixture: ComponentFixture<InvoiceDetailComponent>;
  let mockInvoicesApi: jasmine.SpyObj<InvoicesApiService>;
  let mockTenantService: jasmine.SpyObj<TenantService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockInvoice: Invoice = {
    id: 'invoice-123',
    accountId: 'account-123',
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
    paidAt: null,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: null,
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

  beforeEach(async () => {
    mockInvoicesApi = jasmine.createSpyObj('InvoicesApiService', ['getInvoice']);
    mockTenantService = jasmine.createSpyObj('TenantService', [], {
      currentTenantId: jasmine.createSpy().and.returnValue('tenant-123')
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy().and.returnValue('invoice-123')
        }
      },
      parent: {
        snapshot: {
          paramMap: {
            get: jasmine.createSpy().and.returnValue('account-123')
          }
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [InvoiceDetailComponent],
      providers: [
        { provide: InvoicesApiService, useValue: mockInvoicesApi },
        { provide: TenantService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load invoice on init', () => {
    mockInvoicesApi.getInvoice.and.returnValue(of({ data: mockInvoice }));

    fixture.detectChanges();

    expect(mockInvoicesApi.getInvoice).toHaveBeenCalledWith(
      'tenant-123',
      'account-123',
      'invoice-123'
    );
    expect(component.invoice()).toEqual(mockInvoice);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should display loading state initially', () => {
    mockInvoicesApi.getInvoice.and.returnValue(of({ data: mockInvoice }));

    expect(component.loading()).toBe(true);
  });

  it('should handle 404 error', () => {
    mockInvoicesApi.getInvoice.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    fixture.detectChanges();

    expect(component.error()).toBe('Invoice not found');
    expect(component.loading()).toBe(false);
    expect(component.invoice()).toBeNull();
  });

  it('should handle general errors', () => {
    mockInvoicesApi.getInvoice.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load invoice. Please try again.');
    expect(component.loading()).toBe(false);
  });

  it('should retry loading invoice', () => {
    mockInvoicesApi.getInvoice.and.returnValue(
      throwError(() => ({ status: 500 }))
    );
    fixture.detectChanges();

    mockInvoicesApi.getInvoice.and.returnValue(of({ data: mockInvoice }));
    component.retry();
    fixture.detectChanges();

    expect(mockInvoicesApi.getInvoice).toHaveBeenCalledTimes(2);
    expect(component.invoice()).toEqual(mockInvoice);
    expect(component.error()).toBeNull();
  });

  it('should navigate back to invoice list', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['../'], {
      relativeTo: mockActivatedRoute
    });
  });

  it('should navigate to related ledger entries', () => {
    mockInvoicesApi.getInvoice.and.returnValue(of({ data: mockInvoice }));
    fixture.detectChanges();

    component.viewRelatedLedgerEntries();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/accounts', 'account-123'],
      {
        queryParams: { tab: 'transactions', invoiceId: 'invoice-123' }
      }
    );
  });

  it('should display invoice details correctly', () => {
    mockInvoicesApi.getInvoice.and.returnValue(of({ data: mockInvoice }));
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('INV-2026-001');
    expect(compiled.textContent).toContain('Issued');
  });

  it('should display line items', () => {
    mockInvoicesApi.getInvoice.and.returnValue(of({ data: mockInvoice }));
    fixture.detectChanges();

    expect(component.invoice()?.lineItems.length).toBe(2);
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('Draft')).toContain('gray');
    expect(component.getStatusClass('Issued')).toContain('blue');
    expect(component.getStatusClass('Paid')).toContain('green');
    expect(component.getStatusClass('Overdue')).toContain('red');
    expect(component.getStatusClass('Cancelled')).toContain('gray');
  });
});
