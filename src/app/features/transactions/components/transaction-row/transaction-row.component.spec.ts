import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TransactionRowComponent } from './transaction-row.component';
import { LedgerEntry } from '../../models/ledger-entry.model';
import { SourceType } from '../../models/source-type.enum';

describe('TransactionRowComponent', () => {
  let component: TransactionRowComponent;
  let fixture: ComponentFixture<TransactionRowComponent>;

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
    metadata: {},
    createdAt: '2026-02-05T10:30:00Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionRowComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionRowComponent);
    component = fixture.componentInstance;
    component.ledgerEntry = mockLedgerEntry;
    component.accountId = '123e4567-e89b-12d3-a456-426614174000';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display ledger entry data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ride-123');
  });

  it('should display debit amount when present', () => {
    component.ledgerEntry = { ...mockLedgerEntry, debitAmount: 2500, creditAmount: 0 };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const debitCell = compiled.querySelector('.amount-debit');
    expect(debitCell).toBeTruthy();
  });

  it('should display credit amount when present', () => {
    component.ledgerEntry = { ...mockLedgerEntry, debitAmount: 0, creditAmount: 1500 };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const creditCell = compiled.querySelector('.amount-credit');
    expect(creditCell).toBeTruthy();
  });

  it('should display invoice link when present', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const invoiceLink = compiled.querySelector('.invoice-link');
    expect(invoiceLink).toBeTruthy();
  });

  it('should display dash when no invoice linked', () => {
    component.ledgerEntry = { ...mockLedgerEntry, linkedInvoiceId: null };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const invoiceCell = compiled.querySelector('.invoice-cell');
    expect(invoiceCell?.textContent?.trim()).toBe('-');
  });
});
