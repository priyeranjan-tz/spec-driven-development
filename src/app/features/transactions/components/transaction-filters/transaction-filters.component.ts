import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SourceType } from '../../models/source-type.enum';

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  sourceType?: SourceType;
}

@Component({
  selector: 'app-transaction-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFiltersComponent {
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() sourceType?: SourceType;
  @Output() filtersChange = new EventEmitter<TransactionFilters>();

  localStartDate = signal<string>('');
  localEndDate = signal<string>('');
  localSourceType = signal<SourceType | ''>('');

  readonly SourceType = SourceType;
  readonly sourceTypes = [
    { value: '', label: 'All Types' },
    { value: SourceType.Ride, label: 'Ride' },
    { value: SourceType.Payment, label: 'Payment' }
  ];

  ngOnInit(): void {
    this.localStartDate.set(this.startDate || '');
    this.localEndDate.set(this.endDate || '');
    this.localSourceType.set(this.sourceType || '');
  }

  onStartDateChange(value: string): void {
    this.localStartDate.set(value);
    this.applyFilters();
  }

  onEndDateChange(value: string): void {
    this.localEndDate.set(value);
    this.applyFilters();
  }

  onSourceTypeChange(value: string): void {
    this.localSourceType.set(value as SourceType | '');
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: TransactionFilters = {};

    if (this.localStartDate()) {
      filters.startDate = this.localStartDate();
    }

    if (this.localEndDate()) {
      filters.endDate = this.localEndDate();
    }

    if (this.localSourceType()) {
      filters.sourceType = this.localSourceType() as SourceType;
    }

    this.filtersChange.emit(filters);
  }

  clearFilters(): void {
    this.localStartDate.set('');
    this.localEndDate.set('');
    this.localSourceType.set('');
    this.filtersChange.emit({});
  }

  hasActiveFilters(): boolean {
    return !!(this.localStartDate() || this.localEndDate() || this.localSourceType());
  }

  /**
   * TrackBy function for source type iteration optimization.
   * 
   * @param index - The index of the source type
   * @param item - The source type object
   * @returns Unique identifier for the source type
   */
  trackBySourceTypeValue(index: number, item: { value: string; label: string }): string {
    return item.value;
  }
}
