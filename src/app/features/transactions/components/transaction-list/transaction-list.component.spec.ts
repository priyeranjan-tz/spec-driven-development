import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TransactionListComponent } from './transaction-list.component';
import { TransactionsApiService } from '../../services/transactions-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { LedgerEntry } from '../../models/ledger-entry.model';
import { SourceType } from '../../models/source-type.enum';
import { ApiResponse } from '../../../../core/models/api-response';

describe('TransactionListComponent', () => {
  let component: TransactionListComponent;
  let fixture: ComponentFixture<TransactionListComponent>;
  let transactionsApiService: jasmine.SpyObj<TransactionsApiService>;
  let tenantService: jasmine.SpyObj<TenantService>;

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

  const mockApiResponse: ApiResponse<LedgerEntry> = {
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

  beforeEach(async () => {
    const transactionsApiSpy = jasmine.createSpyObj('TransactionsApiService', ['getLedgerEntries']);
    const tenantServiceSpy = jasmine.createSpyObj('TenantService', ['getCurrentTenantId']);

    await TestBed.configureTestingModule({
      imports: [TransactionListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TransactionsApiService, useValue: transactionsApiSpy },
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

    transactionsApiService = TestBed.inject(TransactionsApiService) as jasmine.SpyObj<TransactionsApiService>;
    tenantService = TestBed.inject(TenantService) as jasmine.SpyObj<TenantService>;
    fixture = TestBed.createComponent(TransactionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ledger entries on init', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(of(mockApiResponse));

    fixture.detectChanges();

    expect(component.ledgerEntries().length).toBe(1);
    expect(component.ledgerEntries()[0]).toEqual(mockLedgerEntry);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle loading state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(of(mockApiResponse));

    component.loadLedgerEntries();

    expect(component.isLoading()).toBe(false);
  });

  it('should handle error state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.loadLedgerEntries();

    expect(component.error()).toBe('Failed to load transactions. Please try again.');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle empty state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(of({
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

    component.loadLedgerEntries();

    expect(component.ledgerEntries().length).toBe(0);
    expect(component.error()).toBeNull();
  });

  it('should handle pagination', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(of(mockApiResponse));

    component.onPageChange(2);

    expect(component.currentPage()).toBe(2);
    expect(transactionsApiService.getLedgerEntries).toHaveBeenCalled();
  });

  it('should apply filters and reset to page 1', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(of(mockApiResponse));
    component.currentPage.set(3);

    component.onFiltersChange({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sourceType: SourceType.Ride
    });

    expect(component.startDate()).toBe('2026-01-01');
    expect(component.endDate()).toBe('2026-01-31');
    expect(component.sourceType()).toBe(SourceType.Ride);
    expect(component.currentPage()).toBe(1);
  });

  it('should retry on error', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntries.and.returnValue(of(mockApiResponse));

    component.onRetry();

    expect(transactionsApiService.getLedgerEntries).toHaveBeenCalled();
  });

  it('should track ledger entries by id', () => {
    const trackId = component.trackByLedgerEntryId(0, mockLedgerEntry);
    expect(trackId).toBe(mockLedgerEntry.id);
  });
});
