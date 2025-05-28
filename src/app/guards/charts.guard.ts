import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectGroupID } from '../store/auth/auth.selectors';
import { map } from 'rxjs';

export const chartsGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectGroupID).pipe(
    map(groupID => {
      if (groupID !== 1004) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
