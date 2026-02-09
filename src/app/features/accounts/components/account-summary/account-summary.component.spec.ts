import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSummaryComponent } from './account-summary.component';
import { Account } from '../../models/account.model';
import { AccountType } from '../../models/account-type.enum';
import { AccountStatus } from '../../models/account-status.enum';

describe('AccountSummaryComponent', () => {
  let component: AccountSummaryComponent;
  let fixture: ComponentFixture<AccountSummaryComponent>;

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
    await TestBed.configureTestingModule({
      imports: [AccountSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSummaryComponent);
    component = fixture.componentInstance;
    component.account = mockAccount;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display account name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('General Hospital');
  });

  it('should display current balance', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('$1,250.50');
  });

  it('should display account type', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Organization');
  });

  it('should display account status', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('active');
  });

  it('should display last invoice date', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('2026');
  });

  it('should display account ID', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('123e4567-e89b-12d3-a456-426614174001');
  });

  it('should handle null last invoice date', () => {
    component.account = { ...mockAccount, lastInvoiceDate: null };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No invoices yet');
  });

  it('should show correct status color for active', () => {
    const color = component.getStatusColor(AccountStatus.Active);
    expect(color).toContain('green');
  });

  it('should show correct status color for suspended', () => {
    const color = component.getStatusColor(AccountStatus.Suspended);
    expect(color).toContain('yellow');
  });

  it('should show correct status color for closed', () => {
    const color = component.getStatusColor(AccountStatus.Closed);
    expect(color).toContain('red');
  });
});
