import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { AccountDetailComponent } from './account-detail.component';
import { AccountsApiService } from '../../services/accounts-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Account } from '../../models/account.model';
import { AccountType } from '../../models/account-type.enum';
import { AccountStatus } from '../../models/account-status.enum';

describe('AccountDetailComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;
  let mockAccountsApiService: jasmine.SpyObj<AccountsApiService>;
  let mockTenantService: jasmine.SpyObj<TenantService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let paramsSubject: BehaviorSubject<any>;
  let queryParamsSubject: BehaviorSubject<any>;

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

  beforeEach(async () => {
    mockAccountsApiService = jasmine.createSpyObj('AccountsApiService', ['getAccount']);
    mockTenantService = jasmine.createSpyObj('TenantService', ['getCurrentTenantId']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    paramsSubject = new BehaviorSubject({ id: '123e4567-e89b-12d3-a456-426614174001' });
    queryParamsSubject = new BehaviorSubject({});

    mockTenantService.getCurrentTenantId.and.returnValue('123e4567-e89b-12d3-a456-426614174000');
    mockAccountsApiService.getAccount.and.returnValue(of(mockAccount));

    await TestBed.configureTestingModule({
      imports: [AccountDetailComponent],
      providers: [
        { provide: AccountsApiService, useValue: mockAccountsApiService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable(),
            queryParams: queryParamsSubject.asObservable(),
            snapshot: {
              params: { id: '123e4567-e89b-12d3-a456-426614174001' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load account on init', () => {
    fixture.detectChanges();
    
    expect(mockAccountsApiService.getAccount).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001'
    );
    expect(component.account()).toEqual(mockAccount);
    expect(component.loading()).toBe(false);
  });

  it('should handle loading state', () => {
    component.loading.set(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-loading-spinner')).toBeTruthy();
  });

  it('should handle 404 error', () => {
    mockAccountsApiService.getAccount.and.returnValue(
      throwError(() => ({ status: 404, message: 'Not Found' }))
    );
    
    fixture.detectChanges();
    
    expect(component.error()).toBe('Account not found.');
  });

  it('should handle generic error', () => {
    mockAccountsApiService.getAccount.and.returnValue(
      throwError(() => ({ status: 500, message: 'Server Error' }))
    );
    
    fixture.detectChanges();
    
    expect(component.error()).toBe('Failed to load account. Please try again.');
  });

  it('should switch tabs', () => {
    fixture.detectChanges();
    
    component.selectTab('transactions');
    
    expect(component.activeTab()).toBe('transactions');
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should read tab from query params', () => {
    queryParamsSubject.next({ tab: 'invoices' });
    fixture.detectChanges();
    
    expect(component.activeTab()).toBe('invoices');
  });

  it('should show summary tab by default', () => {
    fixture.detectChanges();
    
    expect(component.activeTab()).toBe('summary');
  });

  it('should navigate back to accounts list', () => {
    fixture.detectChanges();
    
    component.goBack();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/accounts']);
  });

  it('should retry loading on error', () => {
    mockAccountsApiService.getAccount.calls.reset();
    fixture.detectChanges();
    
    component.onRetry();
    
    expect(mockAccountsApiService.getAccount).toHaveBeenCalled();
  });

  it('should show all three tabs', () => {
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('button[aria-selected]');
    expect(tabs.length).toBe(3);
  });
});
