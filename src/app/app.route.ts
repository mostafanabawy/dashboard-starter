import { Routes } from '@angular/router';

// dashboard
import { IndexComponent } from './index';
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';
import { CRMComponent } from './apps/crm.component';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            // dashboard
            { path: '', component: CRMComponent},
            { path: '', loadChildren: () => import('./apps/apps.module').then((d) => d.AppsModule) }
        ],
    },

    {
        path: '',
        component: AuthLayout,
        children: [],
    },
];
