import {AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {Person} from './shared/person';
import {DataService} from './services/data.service';
import {AsyncPipe, CurrencyPipe} from '@angular/common';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input'
import {Paginator} from './shared/paginator';
import {BehaviorSubject, debounceTime, finalize, Subject, takeUntil} from 'rxjs';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatOption, MatSelect} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTableModule, MatSortModule, CurrencyPipe, MatPaginatorModule, MatLabel, MatInputModule, MatFormFieldModule, MatProgressSpinner, AsyncPipe, MatSelect, FormsModule, MatOption, MatButton],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private _dataService = inject(DataService);
  private $destroy = new Subject<void>();
  private $searchInput = new Subject<string>();

  readonly baseDisplayColumns = ['name', 'age', 'address', 'email', 'company', 'picture', 'balance'];

  columnToHide!: string
  columnToShow!: string
  totalItems = 0;
  displayedColumns: string[] = this.baseDisplayColumns;
  dataSource = new MatTableDataSource<Person>();
  $isDataLoaded = new BehaviorSubject<boolean>(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.loadData();
    this.$searchInput.pipe(
      debounceTime(500)
    ).subscribe((searchTerm: string) => {
      this.applyFilter(searchTerm)
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.paginator?.page.pipe(
      takeUntil(this.$destroy)
    ).subscribe((pageEvent: PageEvent) => {
      this.loadData(pageEvent.pageIndex, pageEvent.pageSize);
    });
  }

  loadData(pageIndex: number = 0, pageSize: number = 10) {
    this.$isDataLoaded.next(false);
    this._dataService.getData(pageIndex, pageSize).pipe(
      finalize(() => this.$isDataLoaded.next(true)),
      takeUntil(this.$destroy)
    ).subscribe((res: { paginator: Paginator, data: Person[] }) => {
      this.dataSource.data = res.data;
      this.totalItems = res.paginator.totalItems
      this.cdr.detectChanges();
    });
  }

  onSortChange(sortState: Sort) {
    this.$isDataLoaded.next(false);
    this._dataService.sort(sortState).pipe(
      finalize(() => this.$isDataLoaded.next(true)),
      takeUntil(this.$destroy)
    ).subscribe((res: { paginator: Paginator, data: Person[] }) => {
      this.dataSource.data = res.data;
      this.totalItems = res.paginator.totalItems
      this.cdr.detectChanges();
    });
  }

  onSearchInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.$searchInput.next(value);
  }

  applyFilter(filterValue: string) {
    this.$isDataLoaded.next(false);
    this._dataService.filter(filterValue).pipe(
      finalize(() => this.$isDataLoaded.next(true)),
      takeUntil(this.$destroy)
    ).subscribe((res: { paginator: Paginator, data: Person[] }) => {
      this.dataSource.data = res.data;
      this.totalItems = res.paginator.totalItems
      this.cdr.detectChanges();
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  removeColumn() {
    if (this.displayedColumns.findIndex(item => item === this.columnToHide)) {
      this.displayedColumns = this.displayedColumns.filter(column => column !== this.columnToHide)
    }
  }

  addColumn() {
    if (!this.displayedColumns.findIndex(item => item === this.columnToShow)) {
      this.displayedColumns.push(this.columnToShow);
    }
  }

  handlePageEvent(e: PageEvent): void {
    this.loadData(e.pageIndex, e.pageSize)
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    this.$searchInput.complete();
  }
}
