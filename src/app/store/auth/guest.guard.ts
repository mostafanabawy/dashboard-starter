import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectToken } from './auth.selectors';  // adjust path if needed

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectToken).pipe(
      map((token) => {
        if (token) {
          this.router.navigate(['/']); // redirect logged-in users
          return false;
        }
        return true; // allow guest access
      })
    );
  }
}
