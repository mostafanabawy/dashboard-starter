import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectGroupID } from 'src/app/store/auth/auth.selectors';
import { map } from 'rxjs';

export const HistoryGuard: CanActivateFn = () => {
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
