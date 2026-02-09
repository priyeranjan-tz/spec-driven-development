import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InvoiceListComponent } from './invoice-list.component';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Invoice } from '../../models/invoice.model';
import { InvoiceStatus } from '../../models/invoice-status.enum';
import { InvoiceFrequency } from '../../models/invoice-frequency.enum';
import { ApiResponse } from '../../../../core/models/api-response';

describe('InvoiceListComponent', () => {
  let component: InvoiceListComponent;
  let fixture: ComponentFixture<InvoiceListComponent>;
  let invoicesApiService: jasmine.SpyObj<InvoicesApiService>;
  let tenantService: jasmine.SpyObj<TenantService>;

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

  const mockApiResponse: ApiResponse<Invoice> = {
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

  beforeEach(async () => {
    const invoicesApiSpy = jasmine.createSpyObj('InvoicesApiService', ['getInvoices']);
    const tenantServiceSpy = jasmine.createSpyObj('TenantService', ['getCurrentTenantId']);

    await TestBed.configureTestingModule({
      imports: [InvoiceListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: InvoicesApiService, useValue: invoicesApiSpy },
        { provide: TenantService, useValue: tenantServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              params: of({ id: '123e4567-e89b-12d3-a456-426614174000' })
            }
          }
        }
      ]
    }).compileComponents();

    invoicesApiService = TestBed.inject(InvoicesApiService) as jasmine.SpyObj<InvoicesApiService>;
    tenantService = TestBed.inject(TenantService) as jasmine.SpyObj<TenantService>;
    fixture = TestBed.createComponent(InvoiceListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load invoices on init', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));

    fixture.detectChanges();

    expect(component.invoices().length).toBe(1);
    expect(component.invoices()[0]).toEqual(mockInvoice);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle loading state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));

    component.loadInvoices();

    expect(component.isLoading()).toBe(false);
  });

  it('should handle error state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.loadInvoices();

    expect(component.error()).toBe('Failed to load invoices. Please try again.');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle empty state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of({
      data: [],
      pagination: {
        page: 1,
        pageSize: 50,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }
    }));

    component.loadInvoices();

    expect(component.invoices().length).toBe(0);
    expect(component.error()).toBeNull();
  });

  it('should handle pagination', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));

    component.onPageChange(2);

    expect(component.currentPage()).toBe(2);
    expect(invoicesApiService.getInvoices).toHaveBeenCalled();
  });

  it('should apply status filter', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));
    component.currentPage.set(3);

    component.onStatusFilterChange(InvoiceStatus.Paid);

    expect(component.statusFilter()).toBe(InvoiceStatus.Paid);
    expect(component.currentPage()).toBe(1);
    expect(invoicesApiService.getInvoices).toHaveBeenCalled();
  });

  it('should apply frequency filter', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));
    component.currentPage.set(2);

    component.onFrequencyFilterChange(InvoiceFrequency.Weekly);

    expect(component.frequencyFilter()).toBe(InvoiceFrequency.Weekly);
    expect(component.currentPage()).toBe(1);
  });

  it('should clear all filters', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));
    
    component.statusFilter.set(InvoiceStatus.Paid);
    component.frequencyFilter.set(InvoiceFrequency.Monthly);
    component.currentPage.set(2);

    component.clearFilters();

    expect(component.statusFilter()).toBeUndefined();
    expect(component.frequencyFilter()).toBeUndefined();
    expect(component.currentPage()).toBe(1);
  });

  it('should handle sorting by column', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));

    component.onSort('totalCents');

    expect(component.sortBy()).toBe('totalCents');
    expect(component.sortOrder()).toBe('asc');
    expect(component.currentPage()).toBe(1);
  });

  it('should toggle sort order on same column', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));

    component.sortBy.set('totalCents');
    component.sortOrder.set('asc');

    component.onSort('totalCents');

    expect(component.sortOrder()).toBe('desc');
  });

  it('should get correct sort aria value', () => {
    component.sortBy.set('invoiceNumber');
    component.sortOrder.set('asc');

    expect(component.getSortAriaValue('invoiceNumber')).toBe('ascending');
    
    component.sortOrder.set('desc');
    expect(component.getSortAriaValue('invoiceNumber')).toBe('descending');
    
    expect(component.getSortAriaValue('dueDate')).toBeNull();
  });

  it('should detect active filters', () => {
    expect(component.hasActiveFilters()).toBe(false);

    component.statusFilter.set(InvoiceStatus.Paid);
    expect(component.hasActiveFilters()).toBe(true);

    component.statusFilter.set(undefined);
    component.frequencyFilter.set(InvoiceFrequency.Monthly);
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should retry on error', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    invoicesApiService.getInvoices.and.returnValue(of(mockApiResponse));

    component.onRetry();

    expect(invoicesApiService.getInvoices).toHaveBeenCalled();
  });

  it('should track invoices by id', () => {
    const trackId = component.trackByInvoiceId(0, mockInvoice);
    expect(trackId).toBe(mockInvoice.id);
  });
});
