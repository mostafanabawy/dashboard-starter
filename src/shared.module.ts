import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

// service
import { AppService } from 'src/app/service/app.service';

// i18n
import { TranslateModule } from '@ngx-translate/core';

// perfect-scrollbar
import { NgScrollbarModule, provideScrollbarOptions } from 'ngx-scrollbar';

// headlessui
import { MenuModule } from 'headlessui-angular';

// icons
import { IconModule } from 'src/app/shared/icon/icon.module';

// datatable
import { DataTableModule } from '@bhplugin/ng-datatable';
import { NgxCustomModalComponent } from 'ngx-custom-modal';

// apexchart
import { NgApexchartsModule } from 'ng-apexcharts';

// select
import { NgSelectModule } from '@ng-select/ng-select';
import { FlatpickrModule } from 'angularx-flatpickr';


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule.forChild(),
         NgScrollbarModule, MenuModule, IconModule,
          DataTableModule, NgxCustomModalComponent,
          NgSelectModule,
          FlatpickrModule.forRoot(),
        NgApexchartsModule],
    declarations: [],
    exports: [
        // modules
        FormsModule,
        ReactiveFormsModule,
        DataTableModule,
        TranslateModule,
        NgScrollbarModule,
        MenuModule,
        NgxCustomModalComponent,
        IconModule,
        NgApexchartsModule,
        NgSelectModule,
        FlatpickrModule
    ],
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<any> {
        return {
            ngModule: SharedModule,
            providers: [
                Title,
                AppService,
                provideScrollbarOptions({
                    visibility: 'hover',
                    appearance: 'compact',
                }),
            ],
        };
    }
}
