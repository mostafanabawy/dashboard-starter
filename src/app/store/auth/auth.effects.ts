import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from 'src/app/service/auth.service';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthEffects {
    constructor(private actions$: Actions, private authService: AuthService, @Inject(Router) private router: Router) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap(({ UserName, PassWord }) =>
                this.authService.login(UserName, PassWord).pipe(
                    map((response) => {
                        sessionStorage.setItem('token', response.Token);
                        sessionStorage.setItem('UserName', response.UserName);
                        sessionStorage.setItem('DisplayName', response.DisplayName);
                        sessionStorage.setItem("GroupID", response.GroupID);
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
                        if (response.GroupID === 1004) {
                            this.router.navigate(['/charts']);
                        } else {
                            this.router.navigate(['/']);
                        }
                        return AuthActions.loginSuccess({ Token: response.Token, UserName: response.UserName, DisplayName: response.DisplayName, GroupID: response.GroupID });
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

    loginWithZIWO$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginWithZIWO),
            mergeMap(({ username, password }) =>
                this.authService.loginWithZIWO(username, password).pipe(
                    map((response) => {
                        sessionStorage.setItem('tokenZIWO', response.content.access_token);
                        const toast: any = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            customClass: { container: 'toast' },
                        });
                        toast.fire({
                            icon: "success",
                            title: "Login with ZIWO successful",
                            padding: '10px 20px',
                        });
                        return AuthActions.loginWithZIWOSuccess({ tokenZIWO: response.content.access_token });
                    }),
                    catchError((err) => {
                        console.log(err)
                        const toast: any = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            customClass: { container: 'toast' },
                        });
                        toast.fire({
                            icon: 'error',
                            title: 'ZIWO Login Failed',
                            padding: '10px 20px',
                        });

                        return of(AuthActions.loginWithZIWOFailure({ error: err }));
                    })
                )
            )
        )
    );

    logout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logout),
                tap(() => {
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('UserName');
                    sessionStorage.removeItem('DisplayName');
                    sessionStorage.removeItem('GroupID');
                    sessionStorage.removeItem('tokenZIWO');

                    // Important: tap is better for side effects like routing
                    this.router.navigate(['/login']);
                })

            ),
        { dispatch: false } // ❗ No action is dispatched from this effect
    );
}
