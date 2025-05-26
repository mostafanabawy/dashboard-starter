import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { AppState, QuestionsAPIResponse } from '../types/questions.types';
import { Observable } from 'rxjs';
import { HistoryAPIResponse } from '../types/history.types';
import { Store } from '@ngrx/store';

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


    const params = new HttpParams()
      .set('action', 'getpagewithsearch')
      .set('pageno', `${pageNo}`)
      .set('pagesize', '1000')
      .set('sortfield', 'ID')
      .set('sortdirection', '1');
    return this.http.post<QuestionsAPIResponse>(
      'http://208.109.190.145:8085/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx',
      query,         // empty POST body
      { params }  // query string parameters
    );
  }
  fetchHistory(pageNumber: number, payload: { searchText: string, searchBy: string }, sort: number = 1, sortField: string = 'RecordId', pageSize: number = 50): Observable<HistoryAPIResponse> {
    let query: any = {};
    if (payload.searchBy && payload.searchText) {
      query[payload.searchBy] = payload.searchText;
    } else if (payload.searchText) {
      query = { CallStatus: payload.searchText, CallerName: payload.searchText };
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
