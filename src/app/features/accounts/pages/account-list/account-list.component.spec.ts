import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountListComponent } from './account-list.component';
import { AccountsApiService } from '../../services/accounts-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Account } from '../../models/account.model';
import { AccountType } from '../../models/account-type.enum';
import { AccountStatus } from '../../models/account-status.enum';
import { ApiResponse } from '../../../../core/models/api-response';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let mockAccountsApiService: jasmine.SpyObj<AccountsApiService>;
  let mockTenantService: jasmine.SpyObj<TenantService>;
  let mockRouter: jasmine.SpyObj<Router>;

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

  const mockApiResponse: ApiResponse<Account> = {
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

  beforeEach(async () => {
    mockAccountsApiService = jasmine.createSpyObj('AccountsApiService', ['getAccounts']);
    mockTenantService = jasmine.createSpyObj('TenantService', ['getCurrentTenantId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockTenantService.getCurrentTenantId.and.returnValue('123e4567-e89b-12d3-a456-426614174000');
    mockAccountsApiService.getAccounts.and.returnValue(of(mockApiResponse));

    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [
        { provide: AccountsApiService, useValue: mockAccountsApiService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    fixture.detectChanges();
    
    expect(mockAccountsApiService.getAccounts).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      1,
      50,
      undefined,
      undefined
    );
    expect(component.accounts().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should handle loading state', () => {
    component.loading.set(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-loading-spinner')).toBeTruthy();
  });

  it('should handle error state', () => {
    mockAccountsApiService.getAccounts.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    
    fixture.detectChanges();
    
    expect(component.error()).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-error-state')).toBeTruthy();
  });

  it('should handle empty state', () => {
    mockAccountsApiService.getAccounts.and.returnValue(of({
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
    
    fixture.detectChanges();
    
    expect(component.accounts().length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  });

  it('should navigate on account click', () => {
    fixture.detectChanges();
    
    component.onAccountClick(mockAccount);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/accounts', mockAccount.id]);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    mockAccountsApiService.getAccounts.calls.reset();
    
    component.onPageChange(2);
    
    expect(component.currentPage()).toBe(2);
    expect(mockAccountsApiService.getAccounts).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      2,
      50,
      undefined,
      undefined
    );
  });

  it('should apply filters', () => {
    fixture.detectChanges();
    mockAccountsApiService.getAccounts.calls.reset();
    
    component.onApplyFilters({
      status: AccountStatus.Active,
      type: AccountType.Organization
    });
    
    expect(component.statusFilter()).toBe(AccountStatus.Active);
    expect(component.typeFilter()).toBe(AccountType.Organization);
    expect(component.currentPage()).toBe(1);
    expect(mockAccountsApiService.getAccounts).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    component.statusFilter.set(AccountStatus.Active);
    component.typeFilter.set(AccountType.Organization);
    component.currentPage.set(2);
    fixture.detectChanges();
    mockAccountsApiService.getAccounts.calls.reset();
    
    component.onClearFilters();
    
    expect(component.statusFilter()).toBeUndefined();
    expect(component.typeFilter()).toBeUndefined();
    expect(component.currentPage()).toBe(1);
    expect(mockAccountsApiService.getAccounts).toHaveBeenCalled();
  });

  it('should retry on error', () => {
    component.error.set('Test error');
    mockAccountsApiService.getAccounts.calls.reset();
    
    component.onRetry();
    
    expect(mockAccountsApiService.getAccounts).toHaveBeenCalled();
  });
});
