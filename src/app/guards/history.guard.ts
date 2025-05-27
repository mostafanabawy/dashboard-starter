import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, tap, map } from 'rxjs';
import { selectGroupID } from 'src/app/store/auth/auth.selectors';

@Injectable()
export class HistoryGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectGroupID).pipe(
      map((groupID) => {
        if (groupID !== 1006) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      }),
    );
  }
}
