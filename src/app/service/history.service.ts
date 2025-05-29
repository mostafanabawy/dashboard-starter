import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { QuestionsAPIResponse } from '../types/questions.types';
import { Observable } from 'rxjs';
import { HistoryAPIResponse, HistoryRecord } from '../types/history.types';
import { Store } from '@ngrx/store';
import { AppState } from '../types/auth.types';
import { AuthState } from '../store/auth/auth.reducer';

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
  initialHistoryVal = signal<HistoryRecord[] | null>(null);
  store!: AuthState;
  callId = signal<string>('');
  status = signal<string>('');
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
      'https://vcld.ws/badsyaproxystg.php',
      query,
      { params, headers }
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
    const encoded = encodeURIComponent(`/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx?action=getpagewithsearch&pageno=${pageNumber}&pagesize=${pageSize}&sortfield=${sortField}&sortdirection=${sort}`);
    const params = new HttpParams({
      fromString: `page=${encoded}`
    });
    const headers = new HttpHeaders()
      .set('x-auth', `${this.store.token}`);
    // const headers = {}; // <-- header left as empty object
    return this.http.post<HistoryAPIResponse>('https://vcld.ws/badsyaproxystg.php',
      query,
      { params, headers }
    )
  }
  getAgentCalls(phoneNumber: string) {
    const params = new HttpParams({})
      .set('limit', '10') // fetch more
      .set('skip', '0')
      .set('contactNumber', `${phoneNumber}`);
    const headers = new HttpHeaders()
      .set('access_token', `${this.store.tokenZIWO}`);
    return this.http.get<any>("https://badyauniversity-api.aswat.co/agents/channels/calls", { params, headers })
  }
  setAgentCalls(data: any) {
    console.log(data);
    if (data.content.length === 0) {
      this.callId.set('');
      this.status.set('');
      return;
    }
    this.callId.set(data.content[0].callID);
    this.status.set(data.content[0].status);
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
      'https://vcld.ws/badsyaproxystg.php',
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
      'https://vcld.ws/badsyaproxystg.php',
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
      'https://vcld.ws/badsyaproxystg.php',
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
      'https://vcld.ws/badsyaproxystg.php',
      payload,
      { params, headers }
    );
  }

}
