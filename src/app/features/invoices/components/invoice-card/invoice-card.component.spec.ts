import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InvoiceCardComponent } from './invoice-card.component';
import { Invoice } from '../../models/invoice.model';
import { InvoiceStatus } from '../../models/invoice-status.enum';
import { InvoiceFrequency } from '../../models/invoice-frequency.enum';

describe('InvoiceCardComponent', () => {
  let component: InvoiceCardComponent;
  let fixture: ComponentFixture<InvoiceCardComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceCardComponent);
    component = fixture.componentInstance;
    component.invoice = mockInvoice;
    component.accountId = '123e4567-e89b-12d3-a456-426614174000';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display invoice number', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('INV-2026-001');
  });

  it('should display total amount', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('$2,725.00');
  });

  it('should display status badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statusBadge = compiled.querySelector('.status-badge');
    expect(statusBadge?.textContent?.trim()).toBe('Issued');
  });

  it('should apply correct status class', () => {
    expect(component.getStatusClass()).toBe('status-issued');

    component.invoice = { ...mockInvoice, status: InvoiceStatus.Paid };
    expect(component.getStatusClass()).toBe('status-paid');

    component.invoice = { ...mockInvoice, status: InvoiceStatus.Overdue };
    expect(component.getStatusClass()).toBe('status-overdue');
  });

  it('should display frequency label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Monthly');
  });

  it('should format frequency labels correctly', () => {
    expect(component.getFrequencyLabel()).toBe('Monthly');

    component.invoice = { ...mockInvoice, frequency: InvoiceFrequency.PerRide };
    expect(component.getFrequencyLabel()).toBe('Per Ride');

    component.invoice = { ...mockInvoice, frequency: InvoiceFrequency.Weekly };
    expect(component.getFrequencyLabel()).toBe('Weekly');
  });

  it('should display issued date when present', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Issued:');
  });

  it('should display paid date when present', () => {
    component.invoice = { ...mockInvoice, paidAt: '2026-02-10T00:00:00Z' };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Paid:');
  });

  it('should display billing period', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1/1/26');
    expect(compiled.textContent).toContain('1/31/26');
  });

  it('should display due date', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Due Date');
  });

  it('should display subtotal and tax amounts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Subtotal:');
    expect(compiled.textContent).toContain('Tax:');
    expect(compiled.textContent).toContain('$2,500.00');
    expect(compiled.textContent).toContain('$225.00');
  });
});
