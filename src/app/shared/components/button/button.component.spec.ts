import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click event when clicked', () => {
    spyOn(component.buttonClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buttonClick.emit).toHaveBeenCalled();
  });

  it('should not emit click when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    spyOn(component.buttonClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.buttonClick.emit).not.toHaveBeenCalled();
  });

  it('should not emit click when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    spyOn(component.buttonClick, 'emit');
    component.handleClick(new Event('click'));
    expect(component.buttonClick.emit).not.toHaveBeenCalled();
  });

  it('should show loading spinner when loading', () => {
    component.loading = true;
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should apply correct variant classes', () => {
    component.variant = 'primary';
    expect(component.buttonClasses).toContain('bg-primary-600');
    
    component.variant = 'secondary';
    expect(component.buttonClasses).toContain('bg-secondary-200');
  });

  it('should apply correct size classes', () => {
    component.size = 'lg';
    expect(component.buttonClasses).toContain('px-6 py-3');
  });
});
