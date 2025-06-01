import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private http: HttpClient) { }
    baseURL = environment.apiUrl;
    login(UserName: string, PassWord: string): Observable<any> {
        const params = new HttpParams()
            .set('page', '/CRUDGenericHandler/HCLoginsCRUD.ashx?action=dologin')
        return this.http.post<{ Token: string, UserName: string, DisplayName: string }>(`${this.baseURL}`, { UserName, PassWord }, { params }).pipe(
            map(res => res)
        );
    }

    ziwo = {
        username: '',
        password: ''
    }
    loginWithZIWO(username: string, password: string): Observable<any> {
        this.ziwo = {
            username: username,
            password: password
        }
        
        const body = {
            username: username,
            password: password,
            remember: true
        };

        return this.http.post('https://badyauniversity-api.aswat.co/auth/login', body)

    }
}
