import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.currentPage = 1;
    component.totalPages = 10;
    component.totalItems = 500;
    component.pageSize = 50;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate start and end items correctly', () => {
    expect(component.startItem).toBe(1);
    expect(component.endItem).toBe(50);

    component.currentPage = 2;
    expect(component.startItem).toBe(51);
    expect(component.endItem).toBe(100);
  });

  it('should emit page change event', () => {
    spyOn(component.pageChange, 'emit');
    component.onPageChange(3);
    expect(component.pageChange.emit).toHaveBeenCalledWith(3);
  });

  it('should not emit when clicking current page', () => {
    spyOn(component.pageChange, 'emit');
    component.onPageChange(1);
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should handle previous button', () => {
    component.currentPage = 5;
    spyOn(component.pageChange, 'emit');
    component.onPrevious();
    expect(component.pageChange.emit).toHaveBeenCalledWith(4);
  });

  it('should handle next button', () => {
    spyOn(component.pageChange, 'emit');
    component.onNext();
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should disable previous on first page', () => {
    spyOn(component.pageChange, 'emit');
    component.onPrevious();
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should disable next on last page', () => {
    component.currentPage = 10;
    spyOn(component.pageChange, 'emit');
    component.onNext();
    expect(component.pageChange.emit).not.toHaveBeenCalled();
  });

  it('should generate visible pages correctly', () => {
    component.currentPage = 5;
    component.totalPages = 20;
    const pages = component.visiblePages;
    expect(pages.length).toBeLessThanOrEqual(5);
    expect(pages).toContain(5);
  });
});
