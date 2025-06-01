import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { HistoryService } from './service/history.service';
import { Store } from '@ngrx/store';
import { AuthState } from './store/auth/auth.reducer';
import { AppState } from './types/auth.types';
import { AuthService } from './service/auth.service';

declare global {
    interface Window {
        ZIWO: any;
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent {
    store!: AuthState;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private historyTabsService: HistoryService,
        private storeData: Store<AppState>,
        public authService: AuthService
    ) {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                map(() => this.activatedRoute),
                map((route) => {
                    while (route.firstChild) route = route.firstChild;
                    return route;
                }),
                filter((route) => route.outlet === 'primary'),
                switchMap((route) => {
                    return route.data.pipe(
                        map((routeData: any) => {
                            const title = routeData['title'];
                            return { title };
                        }),
                    );
                }),
                tap((data: any) => {
                    let title = data.title;
                    title = (title ? title + ' | ' : '') + 'BADYA DASHBOARD';
                    this.titleService.setTitle(title);
                }),
            )
            .subscribe();
    }
    storeInit(){
        this.storeData
        .select((d) => d.auth)
        .subscribe((d) => {
            this.store = d;
        });
    }
    ngOnInit(): void {
        // Replace with actual credentials
        const agentLogin = {
            username: this.authService.ziwo.username,
            password: this.authService.ziwo.password,
        };

        // Wait for ZIWO plugin to be ready
        window.addEventListener('ziwo-loaded', () => {
            // Authenticate the agent
            (window as any).ZIWOClient.login(agentLogin).then(() => {
                console.log('ZIWO logged in successfully');
            }).catch((err: any) => {
                console.error('Login failed:', err);
            });
        });

        // Optional: Listen to active calls
        window.addEventListener('ziwo-call-active', (event: any) => {
            const callData = event.detail;
            console.log("*************************************************");
            console.log('Caller Number:', callData.contactNumber);
            console.log("*************************************************");
        });
    }
}
