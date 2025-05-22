import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MenuModule } from "headlessui-angular";

// shared module
import { SharedModule } from 'src/shared.module';
import { CRMComponent } from './crm.component';
import { HistoryTablesComponent } from './history-tables/history-tables.component';
import { HistoryTabsComponent } from './history-tabs/history-tabs.component';
import { QuestionsTableComponent } from './questions-table/questions-table.component';
import { AllChartsComponent } from './all-charts/all-charts.component';


const routes: Routes = [
    { path: 'apps/', component: CRMComponent, data: { title: 'CRM' } }
];

@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, SharedModule.forRoot(), MenuModule],
    declarations: [
        CRMComponent,
        HistoryTablesComponent,
        HistoryTabsComponent,
        QuestionsTableComponent,
        AllChartsComponent
    ],
})
export class AppsModule {}
