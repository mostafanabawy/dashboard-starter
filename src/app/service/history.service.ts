import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(
    private http: HttpClient
  ) { }
  fetchQuestions(pageNo: number, formData: { searchText: string, searchBy: string }) {
    console.log(formData);
    let query: any = {};
    if (formData.searchBy && formData.searchText) {
      query[formData.searchBy] = formData.searchText;
    } else if (formData.searchText) {
      query = { Question: formData.searchText };
    }

    console.log(query);

    const params = new HttpParams()
      .set('action', 'getpagewithsearch')
      .set('pageno', `${pageNo}`)
      .set('pagesize', '1000')
      .set('sortfield', 'ID')
      .set('sortdirection', '1');
    return this.http.post(
      'http://208.109.190.145:8085/CRUDGenericHandler/BUBadyaUniversityQuestionsCRUD.ashx',
      query,         // empty POST body
      { params }  // query string parameters
    );
  }
  fetchHistory(pageNumber: number, payload: { searchText: string, searchBy: string }, sort: number = 1, sortField: string = 'RecordId') {
    let query: any = {};
    if (payload.searchBy && payload.searchText) {
      query[payload.searchBy] = payload.searchText;
    } else if (payload.searchText) {
      query = { CallStatus: payload.searchText, CallerName: payload.searchText };
    }
    const params = new HttpParams()
      .set('action', 'getpagewithsearch')
      .set('pageno', `${pageNumber}`)
      .set('pagesize', '50')
      .set('sortfield', `${sortField}`)
      .set('sortdirection', `${sort}`);
    return this.http.post('http://208.109.190.145:8085/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx',
      query,         // empty POST body
      { params }  // query string parameters
    )
  }
  sendFormMainData(formData: any) {
    const params = new HttpParams()
      .set('action', 'insert')
    return this.http.post(
      'http://208.109.190.145:8085/CRUDGenericHandler/BUBadyaUniversityCRUD.ashx',
      formData,
      { params }  // query string parameters
    );
  }
  editRowFormData(formData: any) {
    const params = new HttpParams()
      .set('action', 'update')
    return this.http.post(
      'http://208.109.190.145:8085/CRUDGenericHandler/BUBadyaUniversityQuestions/update.ashx',
      formData,
      { params }  // query string parameters
    );
  }

}
