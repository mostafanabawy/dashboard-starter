import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from 'src/app/service/auth.service';
import { catchError, map, mergeMap, of } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions, private authService: AuthService, private router: Router) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap(({ UserName, PassWord }) =>
                this.authService.login(UserName, PassWord).pipe(
                    map((response) => {
                        sessionStorage.setItem('token', response.Token);
                        sessionStorage.setItem('UserName', response.DisplayName);
                        const toast: any = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            customClass: { container: 'toast' },
                        });
                        toast.fire({
                            icon: "success",
                            title: "Login successful",
                            padding: '10px 20px',
                        });
                        this.router.navigate(['/']);
                        return AuthActions.loginSuccess({ Token: response.Token, UserName: response.UserName });
                    }),
                    catchError((err) => {
                        const toast: any = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            customClass: { container: 'toast' },
                        });
                        toast.fire({
                            icon: 'error',
                            title: 'Invalid Credentials',
                            padding: '10px 20px',
                        });

                        return of(AuthActions.loginFailure({ error: err.message }));
                    })
                )
            )
        )
    );

    logout$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      map(() => {
        this.router.navigate(['/login']); // 🔁 Adjust the route as needed
      })
    ),
  { dispatch: false } // ❗ No action is dispatched from this effect
);
}
