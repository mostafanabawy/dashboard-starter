import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { QuestionsAPIResponse } from '../types/questions.types';
import { Observable } from 'rxjs';
import { HistoryAPIResponse } from '../types/history.types';
import { Store } from '@ngrx/store';
import { AppState } from '../types/auth.types';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(
    private http: HttpClient,
    private storeData: Store<AppState>
  ) {
    this.initStore();
  }
  initialHistoryFetchVal = signal<number | null>(null);
  store!: any;
  initStore() {
    this.storeData
      .select((d) => d.auth)
      .subscribe((d) => {
        this.store = d;
      });
  }
  fetchQuestions(pageNo: number, formData: { searchText: string, searchBy: string }): Observable<QuestionsAPIResponse> {
    console.log(formData);
    let query: any = {};
    if (formData.searchBy && formData.searchText) {
      query[formData.searchBy] = formData.searchText;
    } else if (formData.searchText) {
      query = { Question: formData.searchText };
    }


    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    const params = new HttpParams()
      .set('page', '/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx?action=getpagewithsearch')
      .set('pageno', `${pageNo}`)
      .set('pagesize', '1000')
      .set('sortfield', 'ID')
      .set('sortdirection', '1');
    return this.http.post<QuestionsAPIResponse>(
      'https://vcld.ws/badsyaproxystg.php',
      query,         // empty POST body
      { params, headers }  // query string parameters
    );
  }
  fetchHistory(pageNumber: number, payload: any, sort: number = 1, sortField: string = 'RecordId', pageSize: number = 10): Observable<HistoryAPIResponse> {
    let query: any = {};
    if (payload.searchBy && payload.searchText) {
      query[payload.searchBy] = payload.searchText;
    } else if (payload.searchText) {
      query = { CallStatus: payload.searchText, CallerName: payload.searchText };
    } else {
      query = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
      if (typeof query.DateFrom === 'string') {
        const [dayFrom, monthFrom, yearFromRaw] = query.DateFrom.split("-");
        const yearFrom = Number(yearFromRaw.length === 2 ? '20' + yearFromRaw : yearFromRaw);
        query.DateFrom = new Date(Date.UTC(yearFrom, Number(monthFrom) - 1, Number(dayFrom))).toISOString();
      }

      if (typeof query.DateTo === 'string') {
        const [dayTo, monthTo, yearToRaw] = query.DateTo.split("-");
        const yearTo = Number(yearToRaw.length === 2 ? '20' + yearToRaw : yearToRaw);
        query.DateTo = new Date(Date.UTC(yearTo, Number(monthTo) - 1, Number(dayTo))).toISOString();
      }
    }
    console.log(query);
    const params = new HttpParams()
      .set('page', '/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx?action=getpagewithsearch')
      .set('pageno', `${pageNumber}`)
      .set('pagesize', `${pageSize}`)
      .set('sortfield', `${sortField}`)
      .set('sortdirection', `${sort}`);
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    return this.http.post<HistoryAPIResponse>('https://vcld.ws/badsyaproxystg.php',
      query,         // empty POST body
      { params, headers }  // query string parameters
    )
  }
  sendFormMainData(formData: any) {
    const params = new HttpParams()
      .set('page', '/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx?action=insert');
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    return this.http.post(
      'https://vcld.ws/badsyaproxystg.php',
      formData,
      { params, headers }  // query string parameters
    );
  }
  editRowFormData(formData: any) {
    const params = new HttpParams()
      .set('page', 'CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx?action=update');
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    return this.http.post(
      'https://vcld.ws/badsyaproxystg.php',
      formData,
      { params, headers }  // query string parameters
    );
  }
  addRowFormData(formData: any) {
    console.log(this.store.token);
    const params = new HttpParams()
      .set('page', '/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx?action=insert');

    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    return this.http.post(
      'https://vcld.ws/badsyaproxystg.php',
      formData,
      { params, headers }  // query string parameters
    );
  }

}
