import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionFiltersComponent } from './transaction-filters.component';
import { SourceType } from '../../models/source-type.enum';

describe('TransactionFiltersComponent', () => {
  let component: TransactionFiltersComponent;
  let fixture: ComponentFixture<TransactionFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionFiltersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided filter values', () => {
    component.startDate = '2026-01-01';
    component.endDate = '2026-01-31';
    component.sourceType = SourceType.Ride;
    component.ngOnInit();

    expect(component.localStartDate()).toBe('2026-01-01');
    expect(component.localEndDate()).toBe('2026-01-31');
    expect(component.localSourceType()).toBe(SourceType.Ride);
  });

  it('should emit filters on start date change', () => {
    spyOn(component.filtersChange, 'emit');

    component.onStartDateChange('2026-01-01');

    expect(component.localStartDate()).toBe('2026-01-01');
    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      startDate: '2026-01-01'
    });
  });

  it('should emit filters on end date change', () => {
    spyOn(component.filtersChange, 'emit');

    component.onEndDateChange('2026-01-31');

    expect(component.localEndDate()).toBe('2026-01-31');
    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      endDate: '2026-01-31'
    });
  });

  it('should emit filters on source type change', () => {
    spyOn(component.filtersChange, 'emit');

    component.onSourceTypeChange(SourceType.Payment);

    expect(component.localSourceType()).toBe(SourceType.Payment);
    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      sourceType: SourceType.Payment
    });
  });

  it('should combine multiple filters', () => {
    spyOn(component.filtersChange, 'emit');

    component.localStartDate.set('2026-01-01');
    component.localEndDate.set('2026-01-31');
    component.localSourceType.set(SourceType.Ride);
    component.applyFilters();

    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      sourceType: SourceType.Ride
    });
  });

  it('should clear all filters', () => {
    spyOn(component.filtersChange, 'emit');

    component.localStartDate.set('2026-01-01');
    component.localEndDate.set('2026-01-31');
    component.localSourceType.set(SourceType.Ride);
    component.clearFilters();

    expect(component.localStartDate()).toBe('');
    expect(component.localEndDate()).toBe('');
    expect(component.localSourceType()).toBe('');
    expect(component.filtersChange.emit).toHaveBeenCalledWith({});
  });

  it('should detect active filters', () => {
    expect(component.hasActiveFilters()).toBe(false);

    component.localStartDate.set('2026-01-01');
    expect(component.hasActiveFilters()).toBe(true);

    component.localStartDate.set('');
    component.localSourceType.set(SourceType.Payment);
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should not emit empty filter values', () => {
    spyOn(component.filtersChange, 'emit');

    component.localStartDate.set('2026-01-01');
    component.localEndDate.set('');
    component.localSourceType.set('');
    component.applyFilters();

    expect(component.filtersChange.emit).toHaveBeenCalledWith({
      startDate: '2026-01-01'
    });
  });
});
