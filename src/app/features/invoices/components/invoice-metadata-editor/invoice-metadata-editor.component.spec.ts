import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { InvoiceMetadataEditorComponent } from './invoice-metadata-editor.component';

describe('InvoiceMetadataEditorComponent', () => {
  let component: InvoiceMetadataEditorComponent;
  let fixture: ComponentFixture<InvoiceMetadataEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceMetadataEditorComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceMetadataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.metadataForm.value).toEqual({
      notes: '',
      internalReference: '',
      billingContact: ''
    });
  });

  it('should populate form when metadata input provided', () => {
    const metadata = {
      notes: 'Test notes',
      internalReference: 'REF-001',
      billingContact: 'test@example.com'
    };

    component.metadata = metadata;
    fixture.detectChanges();

    expect(component.notesControl.value).toBe('Test notes');
    expect(component.internalReferenceControl.value).toBe('REF-001');
    expect(component.billingContactControl.value).toBe('test@example.com');
  });

  it('should validate notes max length', () => {
    const longNotes = 'A'.repeat(1001);
    component.notesControl.setValue(longNotes);

    expect(component.notesControl.invalid).toBe(true);
    expect(component.notesControl.errors?.['maxlength']).toBeTruthy();
  });

  it('should validate internal reference max length', () => {
    const longRef = 'A'.repeat(101);
    component.internalReferenceControl.setValue(longRef);

    expect(component.internalReferenceControl.invalid).toBe(true);
    expect(component.internalReferenceControl.errors?.['maxlength']).toBeTruthy();
  });

  it('should validate email format', () => {
    component.billingContactControl.setValue('invalid-email');

    expect(component.billingContactControl.invalid).toBe(true);
    expect(component.billingContactControl.errors?.['email']).toBeTruthy();
  });

  it('should accept valid email', () => {
    component.billingContactControl.setValue('valid@example.com');

    expect(component.billingContactControl.valid).toBe(true);
  });

  it('should emit save event with trimmed values', () => {
    spyOn(component.save, 'emit');

    component.metadataForm.patchValue({
      notes: '  Test notes  ',
      internalReference: '  REF-001  ',
      billingContact: '  test@example.com  '
    });

    component.onSave();

    expect(component.save.emit).toHaveBeenCalledWith({
      notes: 'Test notes',
      internalReference: 'REF-001',
      billingContact: 'test@example.com'
    });
  });

  it('should NOT emit save event when form invalid', () => {
    spyOn(component.save, 'emit');

    component.billingContactControl.setValue('invalid-email');
    component.onSave();

    expect(component.save.emit).not.toHaveBeenCalled();
  });

  it('should NOT emit save event when saving in progress', () => {
    spyOn(component.save, 'emit');

    component.saving = true;
    component.onSave();

    expect(component.save.emit).not.toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should calculate notes character count', () => {
    component.notesControl.setValue('Test');
    expect(component.notesCharCount).toBe(4);

    component.notesControl.setValue('');
    expect(component.notesCharCount).toBe(0);
  });

  it('should allow empty optional fields', () => {
    component.metadataForm.patchValue({
      notes: '',
      internalReference: '',
      billingContact: ''
    });

    expect(component.metadataForm.valid).toBe(true);
  });
});
