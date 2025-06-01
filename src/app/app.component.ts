import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { HistoryService } from './service/history.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        private historyTabsService: HistoryService
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
    ngOnInit(): void {
        window.addEventListener('ziwo-call-active', (event: any) => {
            const callData = event.detail;
            console.log("**************************************************************************");
            console.log(event);
            console.log("**************************************************************************");
            console.log(callData);
            console.log("**************************************************************************");
            console.log('Caller Number:', callData.contactNumber);
            console.log("**************************************************************************");
            this.historyTabsService.setCallerNumber(callData.contactNumber);
            // You can implement additional logic here, such as displaying the number in the UI
        });
    }
}
