import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountCardComponent } from './account-card.component';
import { Account } from '../../models/account.model';
import { AccountType } from '../../models/account-type.enum';
import { AccountStatus } from '../../models/account-status.enum';

describe('AccountCardComponent', () => {
  let component: AccountCardComponent;
  let fixture: ComponentFixture<AccountCardComponent>;

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
      imports: [AccountCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountCardComponent);
    component = fixture.componentInstance;
    component.account = mockAccount;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display account name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('General Hospital');
  });

  it('should display current balance', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('$1,250.50');
  });

  it('should emit accountClick on click', () => {
    spyOn(component.accountClick, 'emit');
    const card = fixture.nativeElement.querySelector('div[role="button"]') as HTMLElement;
    card.click();
    expect(component.accountClick.emit).toHaveBeenCalledWith(mockAccount);
  });

  it('should show correct status color', () => {
    const activeColor = component.getStatusColor(AccountStatus.Active);
    expect(activeColor).toContain('green');

    const suspendedColor = component.getStatusColor(AccountStatus.Suspended);
    expect(suspendedColor).toContain('yellow');

    const closedColor = component.getStatusColor(AccountStatus.Closed);
    expect(closedColor).toContain('red');
  });

  it('should format type label correctly', () => {
    expect(component.getTypeLabel('organization')).toBe('Organization');
    expect(component.getTypeLabel('individual')).toBe('Individual');
  });

  it('should handle keyboard navigation', () => {
    spyOn(component.accountClick, 'emit');
    const card = fixture.nativeElement.querySelector('div[role="button"]') as HTMLElement;
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    card.dispatchEvent(enterEvent);
    expect(component.accountClick.emit).toHaveBeenCalled();
  });
});
