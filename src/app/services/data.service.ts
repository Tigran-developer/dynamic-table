import { Injectable } from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import dataProvider from './dataProvider';
import {Person} from '../shared/person';
import {Paginator} from '../shared/paginator';
import {Sort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _data: Person[] = (dataProvider as Person[])

  getData(page = 0, per_page = 10): Observable<{ paginator: Paginator, data:Person[] }> {
    const res = this._data.slice(per_page*page, (per_page*page)+per_page);
    const pageSize = res.length > per_page ? per_page : res.length;
    const pagination: Paginator = {
      pageIndex: page,
      pageSize: pageSize,
      totalItems: this._data.length
    };
    return of({paginator:pagination, data: res}).pipe(delay(1000));
  }

  filter(filterValue: string, page = 0, per_page = 10) {
    const filteredData =  this._data.filter((person => JSON.stringify(person).toLowerCase().includes(filterValue.toLowerCase())));
    const res = filteredData.slice(per_page*page, (per_page*page)+per_page);
    const pageSize = res.length > per_page ? res.length : per_page;
    const pagination: Paginator = {
      pageIndex: page,
      pageSize: pageSize,
      totalItems: res.length
    };
    return of({paginator:pagination, data: res}).pipe(delay(1000));
  }

  sort(sortState: Sort, page = 0, per_page = 10) {
    const sorted = this._data.sort(
      (itemB: Person, itemA: Person) => DataService.compareFn(itemA, itemB, sortState))
    const res = sorted.slice(per_page*page, (per_page*page)+per_page);
    const pagination: Paginator = {
      pageIndex: page,
      pageSize: per_page,
      totalItems: sorted.length
    };
    return of({paginator:pagination, data: res}).pipe(delay(1000));
  }

  private static compareFn(a: any, b: any, sortState: Sort) {
    if(sortState.direction === 'asc') {
      return a[sortState.active] - b[sortState.active];
    }
    return b[sortState.active] - a[sortState.active];
  }
}
