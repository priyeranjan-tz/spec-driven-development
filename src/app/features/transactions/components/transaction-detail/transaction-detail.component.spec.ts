import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TransactionDetailComponent } from './transaction-detail.component';
import { TransactionsApiService } from '../../services/transactions-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { LedgerEntry } from '../../models/ledger-entry.model';
import { SourceType } from '../../models/source-type.enum';

describe('TransactionDetailComponent', () => {
  let component: TransactionDetailComponent;
  let fixture: ComponentFixture<TransactionDetailComponent>;
  let transactionsApiService: jasmine.SpyObj<TransactionsApiService>;
  let tenantService: jasmine.SpyObj<TenantService>;
  let router: jasmine.SpyObj<Router>;

  const mockLedgerEntry: LedgerEntry = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    accountId: '123e4567-e89b-12d3-a456-426614174000',
    postingDate: '2026-02-05T10:30:00Z',
    sourceType: SourceType.Ride,
    sourceReferenceId: 'ride-123',
    debitAmount: 2500,
    creditAmount: 0,
    runningBalance: 2500,
    linkedInvoiceId: '123e4567-e89b-12d3-a456-426614174002',
    metadata: {
      rideDistance: '5.2 miles',
      rideDuration: '15 minutes'
    },
    createdAt: '2026-02-05T10:30:00Z'
  };

  beforeEach(async () => {
    const transactionsApiSpy = jasmine.createSpyObj('TransactionsApiService', ['getLedgerEntry']);
    const tenantServiceSpy = jasmine.createSpyObj('TenantService', ['getCurrentTenantId']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TransactionDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TransactionsApiService, useValue: transactionsApiSpy },
        { provide: TenantService, useValue: tenantServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              params: of({ id: '123e4567-e89b-12d3-a456-426614174000' })
            },
            params: of({ ledgerEntryId: '123e4567-e89b-12d3-a456-426614174001' }),
            snapshot: {
              params: { ledgerEntryId: '123e4567-e89b-12d3-a456-426614174001' }
            }
          }
        }
      ]
    }).compileComponents();

    transactionsApiService = TestBed.inject(TransactionsApiService) as jasmine.SpyObj<TransactionsApiService>;
    tenantService = TestBed.inject(TenantService) as jasmine.SpyObj<TenantService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(TransactionDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ledger entry on init', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntry.and.returnValue(of(mockLedgerEntry));

    fixture.detectChanges();

    expect(component.ledgerEntry()).toEqual(mockLedgerEntry);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle loading state', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntry.and.returnValue(of(mockLedgerEntry));

    component.loadLedgerEntry('123e4567-e89b-12d3-a456-426614174001');

    expect(component.isLoading()).toBe(false);
  });

  it('should handle 404 error', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntry.and.returnValue(
      throwError(() => ({ status: 404 }))
    );

    component.loadLedgerEntry('non-existent-id');

    expect(component.error()).toBe('Transaction not found');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle generic error', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntry.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.loadLedgerEntry('123e4567-e89b-12d3-a456-426614174001');

    expect(component.error()).toBe('Failed to load transaction details. Please try again.');
  });

  it('should retry on error', () => {
    tenantService.getCurrentTenantId.and.returnValue('tenant-123');
    transactionsApiService.getLedgerEntry.and.returnValue(of(mockLedgerEntry));

    component.onRetry();

    expect(transactionsApiService.getLedgerEntry).toHaveBeenCalled();
  });

  it('should navigate back to transactions list', () => {
    component.accountId.set('123e4567-e89b-12d3-a456-426614174000');

    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(
      ['/accounts', '123e4567-e89b-12d3-a456-426614174000'],
      { queryParams: { tab: 'transactions' } }
    );
  });

  it('should parse metadata entries', () => {
    component.ledgerEntry.set(mockLedgerEntry);

    const entries = component.metadataEntries;

    expect(entries.length).toBe(2);
    expect(entries[0]).toEqual({ key: 'rideDistance', value: '5.2 miles' });
    expect(entries[1]).toEqual({ key: 'rideDuration', value: '15 minutes' });
  });

  it('should handle empty metadata', () => {
    const entryWithoutMetadata = { ...mockLedgerEntry, metadata: {} };
    component.ledgerEntry.set(entryWithoutMetadata);

    const entries = component.metadataEntries;

    expect(entries.length).toBe(0);
  });
});
