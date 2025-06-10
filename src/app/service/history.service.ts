import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { QuestionsAPIResponse } from '../types/questions.types';
import { filter, Observable, tap } from 'rxjs';
import { HistoryAPIResponse, HistoryRecord } from '../types/history.types';
import { Store } from '@ngrx/store';
import { AppState } from '../types/auth.types';
import { AuthState } from '../store/auth/auth.reducer';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  initialHistoryFetchVal = signal<number | null>(null);
  initialHistoryVal = signal<HistoryRecord[] | null>(null);
  store!: AuthState;
  callId = signal<string>('');
  status = signal<string>('');
  callerNumber = signal<string>('');
  private badyaUniversityBaseURL = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private storeData: Store<AppState>
  ) {
    this.initStore();
  }
  initStore() {
    this.storeData
      .select((d) => d.auth)
      .subscribe((d) => {
        this.store = d;
      });
  }
  fetchQuestions(pageNo: number, formData: { searchText: string, searchBy: string }): Observable<QuestionsAPIResponse> {
    let query: any = {};
    if (formData.searchBy && formData.searchText) {
      query[formData.searchBy] = formData.searchText;
    } else if (formData.searchText) {
      query = { Question: formData.searchText };
    }

    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    // const headers = {}; // <-- header left as empty object

    const encoded = encodeURIComponent(`/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx?action=getpagewithsearch&pageno=${pageNo}&pagesize=1000&sortfield=ID&sortdirection=1`)
    const params = new HttpParams({
      fromString: `page=${encoded}`
    })
    return this.http.post<QuestionsAPIResponse>(
      `${this.badyaUniversityBaseURL}`,
      query,
      { params, headers }
    );
  }
  fetchHistory(pageNumber: number, payload: any, sort: number = 1, sortField: string = 'RecordId', pageSize: number = 10000): Observable<HistoryAPIResponse> {
    let query: any = {};
    if (payload.searchBy && payload.searchText) {
      query[payload.searchBy] = payload.searchText;
    } else if (payload.searchText) {
      query = { CallStatus: payload.searchText, CallerName: payload.searchText };
    } else {
      query = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );
    }
    const encoded = encodeURIComponent(`/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx?action=getpagewithsearch&pageno=${pageNumber}&pagesize=${pageSize}&sortfield=${sortField}&sortdirection=${sort}`);
    const params = new HttpParams({
      fromString: `page=${encoded}`
    });
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    // const headers = {}; // <-- header left as empty object
    return this.http.post<HistoryAPIResponse>(`${this.badyaUniversityBaseURL}`,
      query,
      { params, headers }
    )
  }
  getAgentCalls(phoneNumber?: string) {
    const params = new HttpParams()
      .set('limit', '1000') // fetch more
    const headers = new HttpHeaders()
      .set('access_token', `${this.store.tokenZIWO}`);
    return this.http.get<any>("https://badyauniversity-api.aswat.co/agents/channels/calls", { params, headers })
  }
  getCallLive() {
    return window.ZIWO.calls.callEvents$.pipe(
      filter((event: any) => event.type === 'active'),
      tap(() => console.log('Got an active event'))
    )
  }
  resetAgentCalls() {
    this.callId.set('');
    this.status.set('');
    this.callerNumber.set('');
  }

  setAgentCalls(data: any) {
    if (!data.number && !data.callId) {
      this.callId.set('');
      this.status.set('');
      return;
    }
    this.status.set('Active');
    this.callId.set(data.callId);
    this.callerNumber.set(data.number);
  }
  setCallerNumber(phoneNumber: string) {
    this.callerNumber.set(phoneNumber);
  }
  sendFormMainData(formData: any) {
    const encoded = encodeURIComponent('/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx?action=insert');
    const params = new HttpParams({
      fromString: `page=${encoded}`
    });
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    // const headers = {}; // <-- header left as empty object
    return this.http.post(
      `${this.badyaUniversityBaseURL}`,
      formData,
      { params, headers }
    );
  }
  editRowFormData(formData: any) {

    const encoded = encodeURIComponent(`/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx?action=update`);
    const params = new HttpParams({
      fromString: `page=${encoded}`
    });
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    // const headers = {}; // <-- header left as empty object
    return this.http.post(
      `${this.badyaUniversityBaseURL}`,
      formData,
      { params, headers }
    );
  }
  addRowFormData(formData: any) {
    const encoded = encodeURIComponent('/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx?action=insert');
    const params = new HttpParams({
      fromString: `page=${encoded}`
    });

    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    // const headers = {}; // <-- header left as empty object
    return this.http.post(
      `${this.badyaUniversityBaseURL}`,
      formData,
      { params, headers }
    );
  }

  getChartsData(payload: any): Observable<any> {
    const encoded = encodeURIComponent('/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx?action=statstics');
    const params = new HttpParams({
      fromString: `page=${encoded}`
    });
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    return this.http.post(
      `${this.badyaUniversityBaseURL}`,
      payload,
      { params, headers }
    );
  }

}
