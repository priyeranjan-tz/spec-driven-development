import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoiceLineItemsComponent } from './invoice-line-items.component';
import { InvoiceLineItem } from '../../models/invoice-line-item.model';

describe('InvoiceLineItemsComponent', () => {
  let component: InvoiceLineItemsComponent;
  let fixture: ComponentFixture<InvoiceLineItemsComponent>;

  const mockLineItems: InvoiceLineItem[] = [
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
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceLineItemsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceLineItemsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty message when no line items', () => {
    component.lineItems = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('No line items');
  });

  it('should display line items table', () => {
    component.lineItems = mockLineItems;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('should display correct number of rows', () => {
    component.lineItems = mockLineItems;
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="line-item-row"]');
    expect(rows.length).toBe(2);
  });

  it('should display ride ID', () => {
    component.lineItems = mockLineItems;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('ride-001');
    expect(compiled.textContent).toContain('ride-002');
  });

  it('should display description', () => {
    component.lineItems = mockLineItems;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Pickup: 123 Main St');
    expect(compiled.textContent).toContain('Pickup: 789 Elm St');
  });

  it('should use trackBy for performance', () => {
    const trackById = component.trackByLineItemId(0, mockLineItems[0]);
    expect(trackById).toBe('line-001');
  });

  it('should display table headers', () => {
    component.lineItems = mockLineItems;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th');
    expect(headers.length).toBe(4);
    expect(headers[0].textContent).toContain('Ride ID');
    expect(headers[1].textContent).toContain('Date');
    expect(headers[2].textContent).toContain('Description');
    expect(headers[3].textContent).toContain('Fare');
  });
});
