import { Component, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from '../service/app.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { toggleAnimation } from 'src/app/shared/animations';

import * as AuthActions from "../store/auth/auth.actions"
import { AppState } from '../types/auth.types';
@Component({
    moduleId: module.id,
    selector: 'header',
    templateUrl: './header.html',
    animations: [toggleAnimation],
    standalone: false
})
export class HeaderComponent {
    store!: AppState;
    search = false;
    username = signal<string>('');

    constructor(
        public translate: TranslateService,
        public storeData: Store<AppState>,
        public router: Router,
        private appSetting: AppService,
        private sanitizer: DomSanitizer,
    ) {
        this.initStore();
    }
    async initStore() {
        this.storeData
            .select((d) => ({
                index: d.index,
                auth: d.auth
            }))
            .subscribe((d) => {
                this.store = d;
                this.username.set(this.store.auth.DisplayName!);
            });
    }

    ngOnInit() {
        this.setActiveDropdown();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.setActiveDropdown();
            }
        });
    }

    setActiveDropdown() {
        const selector = document.querySelector('ul.horizontal-menu a[routerLink="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }


    changeLanguage(item: any) {
        this.translate.use(item.code);
        this.appSetting.toggleLanguage(item);
        if (this.store.index.locale?.toLowerCase() === 'ae') {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'rtl' });
        } else {
            this.storeData.dispatch({ type: 'toggleRTL', payload: 'ltr' });
        }
        window.location.reload();
    }
    logout() {
        this.storeData.dispatch(AuthActions.logout());
    }
}
