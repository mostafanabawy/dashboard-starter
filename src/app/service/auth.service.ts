import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private http: HttpClient) { }

    login(UserName: string, PassWord: string): Observable<any> {
        const params = new HttpParams()
            .set('page', '/CRUDGenericHandler/HCLoginsCRUD.ashx?action=dologin')
        return this.http.post<{ Token: string, UserName: string, DisplayName: string }>('https://vcld.ws/badsyaproxystg.php', { UserName, PassWord }, { params}).pipe(
            map(res => res)
        );
    }
}
