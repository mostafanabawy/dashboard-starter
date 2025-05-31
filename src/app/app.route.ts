import { Routes } from '@angular/router';

// dashboard
import { IndexComponent } from './index';
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';
import { CRMComponent } from './apps/crm.component';
import { LoginComponent } from './apps/login.component';
import { AuthGuard } from './store/auth/auth.guard';
import { AllChartsComponent } from './apps/all-charts/all-charts.component';
import { GuestGuard } from './store/auth/guest.guard';
import { HistoryTablesComponent } from './apps/history-tables/history-tables.component';
import { HistoryGuard } from './guards/history.guard';
import { chartsGuard } from './guards/charts.guard';
import { AppsModule } from './apps/apps.module';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            // dashboard
            { path: '', component: CRMComponent},
            //{ path: '', loadChildren: () => import('./apps/apps.module').then((d) => d.AppsModule) },
            {path: '', loadChildren: () => AppsModule},
            { path: 'charts', component: AllChartsComponent, canActivate: [chartsGuard]},
            { path: 'history', component: HistoryTablesComponent, canActivate: [HistoryGuard]}
        ],
    },

    {
        path: '',
        component: AuthLayout,
        canActivate: [GuestGuard],
        children: [
            { path: 'login', component: LoginComponent }
        ],
    },
];
