import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunningBalanceDisplayComponent } from './running-balance-display.component';

describe('RunningBalanceDisplayComponent', () => {
  let component: RunningBalanceDisplayComponent;
  let fixture: ComponentFixture<RunningBalanceDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunningBalanceDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RunningBalanceDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify positive balance', () => {
    component.balance = 2500;
    expect(component.isPositive).toBe(true);
    expect(component.isNegative).toBe(false);
    expect(component.isZero).toBe(false);
  });

  it('should identify negative balance', () => {
    component.balance = -1500;
    expect(component.isPositive).toBe(false);
    expect(component.isNegative).toBe(true);
    expect(component.isZero).toBe(false);
  });

  it('should identify zero balance', () => {
    component.balance = 0;
    expect(component.isPositive).toBe(false);
    expect(component.isNegative).toBe(false);
    expect(component.isZero).toBe(true);
  });

  it('should calculate absolute balance', () => {
    component.balance = -2500;
    expect(component.absoluteBalance).toBe(2500);

    component.balance = 2500;
    expect(component.absoluteBalance).toBe(2500);

    component.balance = 0;
    expect(component.absoluteBalance).toBe(0);
  });

  it('should display positive balance with correct CSS class', () => {
    component.balance = 2500;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const balanceElement = compiled.querySelector('.running-balance');
    expect(balanceElement?.classList.contains('balance-positive')).toBe(true);
  });

  it('should display negative balance with correct CSS class and sign', () => {
    component.balance = -1500;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const balanceElement = compiled.querySelector('.running-balance');
    expect(balanceElement?.classList.contains('balance-negative')).toBe(true);
    
    const signElement = compiled.querySelector('.balance-sign');
    expect(signElement?.textContent).toBe('-');
  });

  it('should display zero balance with correct CSS class', () => {
    component.balance = 0;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const balanceElement = compiled.querySelector('.running-balance');
    expect(balanceElement?.classList.contains('balance-zero')).toBe(true);
  });
});
