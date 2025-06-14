import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistoryService } from 'src/app/service/history.service';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FollowUpAPIResponse, HistoryAPIResponse, HistoryRecord } from 'src/app/types/history.types';
import { AuthState } from 'src/app/store/auth/auth.reducer';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/types/auth.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-follow-up-table',
  templateUrl: './follow-up-table.component.html',
})
export class FollowUpTableComponent implements OnInit {
  rows = signal<any>([])
  singleRowForm!: FormGroup;
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRows = signal<number>(0);
  loading = true;
  search1 = '';
  cols: any[] = [];
  store!: AuthState;
  private langChangeSub!: Subscription;
  refreshFlag = false;
  followUpEditRow = computed<HistoryRecord | null>(() => {
    return this.tabsHisoryService.followUpEditRow();
  })
  constructor(
    private tabsHisoryService: HistoryService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private storeData: Store<AppState>,
    public router: Router
  ) {
    this.initStore();
    effect(() => {
      const changedRow = this.followUpEditRow();
      if ( changedRow === null) {
        this.tabsHisoryService.fetchFollowUp().subscribe((res: FollowUpAPIResponse) => {
          this.rows.set(res.FollowUp);
          this.totalRows.set(res.FollowUp.length);
          this.loading = false;
        });
      }
    })

  }
  ngOnInit() {
    this.tabsHisoryService.fetchFollowUp().subscribe((res: FollowUpAPIResponse) => {
      this.rows.set(res.FollowUp);
      this.totalRows.set(res.FollowUp.length);
      this.loading = false;
    });

    (window as any).XLSX = XLSX;
    this.translateCols();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.translateCols();
    });
  }

  translateCols() {
    const keys = [
      'table.RecordId',
      'table.CallerName',
      'table.PhoneNumber',
      'table.OtherNumber',
      'table.CallerType',
      'table.TypeOfCall',
      'table.Status',
      'table.City',
      'table.SchoolName',
      'table.Percentage',
      'table.CertificateType',
      'table.Notes',
      'table.Date',
      'table.Questions',
      'table.FollowUp',
      'table.Answer',
      'Call ID',
      'table2.Action'
    ];

    this.translate.get(keys).subscribe(translations => {
      this.cols = [
        { field: 'RecordId', title: translations['table.RecordId'], maxWidth: '6%' },
        { field: 'CallID', title: translations['Call ID'], maxWidth: '6%' },
        { field: 'CallerName', title: translations['table.CallerName'], maxWidth: '8%' },
        { field: 'PhoneNumber', title: translations['table.PhoneNumber'], maxWidth: '7%' },
        { field: 'WhatsAppNumber', title: translations['table.OtherNumber'], maxWidth: '7%' },
        { field: 'CallerType', title: translations['table.CallerType'], maxWidth: '6%' },
        { field: 'ExtraField1', title: translations['table.TypeOfCall'], maxWidth: '6%' },
        { field: 'City', title: translations['table.City'], maxWidth: '6%' },
        { field: 'SchoolName', title: translations['table.SchoolName'], maxWidth: '10%' },
        { field: 'Percentage', title: translations['table.Percentage'], maxWidth: '5%' },
        { field: 'CertificateType', title: translations['table.CertificateType'], maxWidth: '7%' },
        { field: 'Notes', title: translations['table.Notes'], maxWidth: '10%' },
        { field: 'CreationDate', title: translations['table.Date'], maxWidth: '6%' },
        { field: 'ExtraField3', title: translations['table.Questions'], maxWidth: '10%' },
        { field: 'FollowUp', title: translations['table.FollowUp'], maxWidth: '6%' },
        { field: 'Answer', title: translations['table.Answer'], maxWidth: '5%' },
        { field: 'CallStatus', title: translations['table.Status'], filter: false, maxWidth: '5%' },
        { field: 'action', title: translations['table2.Action'], filter: false, headerClass: 'justify-center' }
      ];
    });
  }


  

  initStore() {
    this.storeData
      .select((d) => d.auth)
      .subscribe((d) => {
        this.store = d;
      });
  }

  patchCRMForm(row: any) {
    this.tabsHisoryService.followUpEditRow.set(row)
  }
  onPageChange(event: any) {
    this.currentPage.set(event)
  }

  ngOnDestroy() {
    // Prevent memory leaks
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}