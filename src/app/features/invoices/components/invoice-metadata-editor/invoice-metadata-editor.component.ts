import { Component, Input, Output, EventEmitter, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VALIDATION_LIMITS } from '../../../../core/constants/app.constants';

/**
 * Invoice metadata editor component for editing non-financial invoice fields.
 * 
 * Provides a form for editing invoice metadata (notes, internal reference, billing contact)
 * with validation. Financial fields cannot be modified through this component.
 * 
 * @remarks
 * - Uses reactive forms with validation
 * - Uses OnPush change detection
 * - Enforces field length limits (notes: 1000, internalReference: 100)
 * - Validates email format for billingContact
 * - Shows character count for notes field
 * - Emits save/cancel events for parent to handle
 * - Trims whitespace from all fields before saving
 * 
 * @example
 * ```html
 * <!-- In invoice detail template -->
 * <app-invoice-metadata-editor
 *   [metadata]="{
 *     notes: invoice.notes,
 *     internalReference: invoice.internalReference,
 *     billingContact: invoice.billingContact
 *   }"
 *   [saving]="isSaving"
 *   (save)="onSaveMetadata($event)"
 *   (cancel)="onCancelEdit()">
 * </app-invoice-metadata-editor>
 * 
 * <!-- In parent component -->
 * isSaving = false;
 * 
 * onSaveMetadata(metadata: { notes: string; internalReference: string; billingContact: string }) {
 *   this.isSaving = true;
 *   this.invoicesService.updateInvoiceMetadata(
 *     this.tenantId,
 *     this.accountId,
 *     this.invoiceId,
 *     metadata
 *   ).subscribe({
 *     next: (response) => {
 *       this.invoice = response.data;
 *       this.isSaving = false;
 *       this.isEditing = false;
 *     },
 *     error: (err) => {
 *       console.error('Failed to save:', err);
 *       this.isSaving = false;
 *     }
 *   });
 * }
 * 
 * onCancelEdit() {
 *   this.isEditing = false;
 * }
 * ```
 */
@Component({
  selector: 'app-invoice-metadata-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invoice-metadata-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceMetadataEditorComponent {
  @Input({ required: true }) set metadata(value: { notes?: string; internalReference?: string; billingContact?: string }) {
    if (value) {
      this.metadataForm.patchValue({
        notes: value.notes || '',
        internalReference: value.internalReference || '',
        billingContact: value.billingContact || ''
      });
    }
  }

  @Input() saving = false;
  @Output() save = new EventEmitter<{ notes: string; internalReference: string; billingContact: string }>();
  @Output() cancel = new EventEmitter<void>();

  metadataForm: FormGroup;
  
  readonly NOTES_MAX_LENGTH = VALIDATION_LIMITS.INVOICE_NOTES_MAX_LENGTH;
  readonly INTERNAL_REF_MAX_LENGTH = VALIDATION_LIMITS.INVOICE_INTERNAL_REF_MAX_LENGTH;

  constructor(private fb: FormBuilder) {
    this.metadataForm = this.fb.group({
      notes: ['', [Validators.maxLength(this.NOTES_MAX_LENGTH)]],
      internalReference: ['', [Validators.maxLength(this.INTERNAL_REF_MAX_LENGTH)]],
      billingContact: ['', [Validators.email]]
    });
  }

  get notesControl() {
    return this.metadataForm.get('notes')!;
  }

  get internalReferenceControl() {
    return this.metadataForm.get('internalReference')!;
  }

  get billingContactControl() {
    return this.metadataForm.get('billingContact')!;
  }

  get notesCharCount(): number {
    return (this.notesControl.value || '').length;
  }

  /**
   * Handles save action.
   * 
   * Validates form and emits trimmed metadata values.
   * Only emits if form is valid and not currently saving.
   */
  onSave(): void {
    if (this.metadataForm.valid && !this.saving) {
      const formValue = this.metadataForm.value;
      this.save.emit({
        notes: formValue.notes?.trim() || '',
        internalReference: formValue.internalReference?.trim() || '',
        billingContact: formValue.billingContact?.trim() || ''
      });
    }
  }

  /**
   * Handles cancel action.
   * 
   * Emits cancel event for parent to handle (typically closes editor).
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
