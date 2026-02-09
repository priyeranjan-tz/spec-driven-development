import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableColumn } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  const mockColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: false }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    component.columns = mockColumns;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render column headers', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toContain('Name');
  });

  it('should emit sort event when sortable column is clicked', () => {
    spyOn(component.sort, 'emit');
    component.onSort(mockColumns[0]);
    expect(component.sort.emit).toHaveBeenCalledWith({
      column: 'name',
      direction: 'asc'
    });
  });

  it('should not emit sort event for non-sortable column', () => {
    spyOn(component.sort, 'emit');
    component.onSort(mockColumns[2]);
    expect(component.sort.emit).not.toHaveBeenCalled();
  });

  it('should cycle through sort directions', () => {
    component.sortColumn = 'name';
    component.sortDirection = 'asc';
    spyOn(component.sort, 'emit');
    
    component.onSort(mockColumns[0]);
    expect(component.sort.emit).toHaveBeenCalledWith({
      column: 'name',
      direction: 'desc'
    });
  });

  it('should show sort indicator for sorted column', () => {
    component.sortColumn = 'name';
    component.sortDirection = 'asc';
    fixture.detectChanges();
    const indicator = fixture.nativeElement.querySelector('th span:last-child');
    expect(indicator?.textContent).toContain('↑');
  });
});
