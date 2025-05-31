import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HistoryService } from 'src/app/service/history.service';
import alasql from 'alasql';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HistoryAPIResponse } from 'src/app/types/history.types';
import { AuthState } from 'src/app/store/auth/auth.reducer';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/types/auth.types';
import { FlatpickrDefaultsInterface } from 'angularx-flatpickr';
import { Router } from '@angular/router';
@Component({
  selector: 'app-history-tables',
  templateUrl: './history-tables.component.html'
})
export class HistoryTablesComponent implements OnInit {
  rows = signal<any>([])
  searchForm!: FormGroup;
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRows = signal<number>(0);
  loading = true;
  search1 = '';
  cols: any[] = [];
  store!: AuthState;
  private langChangeSub!: Subscription;
  basic: FlatpickrDefaultsInterface;
  callId = computed<string>(() => {
    return this.tabsHisoryService.callId();
  });
  constructor(
    private tabsHisoryService: HistoryService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private storeData: Store<AppState>,
    public router: Router
  ) {
    this.initStore();
    this.initForm();
    effect(() => {
      const value = this.tabsHisoryService.initialHistoryFetchVal();

      // Fetch or update based on the new value
      this.tabsHisoryService.fetchHistory(1, { searchText: `${this.tabsHisoryService.initialHistoryFetchVal()}`, searchBy: 'PhoneNumber' }).subscribe((res: HistoryAPIResponse) => {
        this.rows.set(res.result.items);
        this.totalRows.set(res.result.PagingInfo[0].TotalRows);
        this.loading = false;
      });
      if (this.router.url === "/history"){
        this.searchForm.patchValue({
          PhoneNumber: value
        })
      }else{
        this.searchForm.patchValue({
          searchText: value,
          searchBy: 'PhoneNumber'
        });
      }
    });
    this.basic = {
      dateFormat: 'd-m-y',
      monthSelectorType: 'dropdown'
    };
  }
  ngOnInit() {
    this.rows.set(this.tabsHisoryService.initialHistoryVal());
    
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
      'Call ID'
    ];

    this.translate.get(keys).subscribe(translations => {
      this.cols = [
        { field: 'RecordId', title: translations['table.RecordId'], maxWidth: '6%' },
        { field: 'CallerName', title: translations['table.CallerName'], maxWidth: '8%' },
        { field: 'PhoneNumber', title: translations['table.PhoneNumber'], maxWidth: '7%' },
        { field: 'WhatsAppNumber', title: translations['table.OtherNumber'], maxWidth: '7%' },
        { field: 'CallerType', title: translations['table.CallerType'], maxWidth: '6%' },
        { field: 'ExtraField1', title: translations['table.TypeOfCall'], maxWidth: '6%' },
        { field: 'CallStatus', title: translations['table.Status'], maxWidth: '5%' },
        { field: 'City', title: translations['table.City'], maxWidth: '6%' },
        { field: 'SchoolName', title: translations['table.SchoolName'], maxWidth: '10%' },
        { field: 'Percentage', title: translations['table.Percentage'], maxWidth: '5%' },
        { field: 'CertificateType', title: translations['table.CertificateType'], maxWidth: '7%' },
        { field: 'Notes', title: translations['table.Notes'], maxWidth: '10%' },
        { field: 'CreationDate', title: translations['table.Date'], maxWidth: '6%' },
        { field: 'ExtraField3', title: translations['table.Questions'], maxWidth: '10%' },
        { field: 'FollowUp', title: translations['table.FollowUp'], maxWidth: '6%' },
        { field: 'Answer', title: translations['table.Answer'], maxWidth: '5%' },
        { field: 'CallID', title: translations['Call ID'], maxWidth: '6%' }
      ];
    });
  }

  
  initForm() {
    this.searchForm = this.router.url !== "/history" ? this.fb.group({
      searchText: [''],
      searchBy: ['']
    }) :
      this.fb.group({
        CallStatus: [''],
        DateFrom: [''],
        DateTo: [''],
        ExtraField1: [''],
        FollowUp: [''],
        IsSearch: [true],
        PhoneNumber: ['', [
          Validators.pattern(/^\d{11}$/)
        ]]
      });
  }

  initStore() {
    this.storeData
      .select((d) => d.auth)
      .subscribe((d) => {
        this.store = d;
      });
  }
  onSearch() {
    this.loading = true;
    this.currentPage.set(1);
    this.tabsHisoryService.fetchHistory(this.currentPage(), this.searchForm.value).subscribe((res: any) => {
      this.rows.set(res.result.items);
      this.totalRows.set(res.result.PagingInfo[0].TotalRows);
      this.pageSize.set(res.result.PagingInfo[0].PageSize);
      this.loading = false;
    });
  }
  exportData() {
    this.tabsHisoryService.fetchHistory(1, this.searchForm.value, 1, 'RecordId', 1000).subscribe((res: any) => {
      alasql('SELECT * INTO XLSX("History.xlsx",{headers:true}) FROM ?', [res.result.items]);
    });
  }
  onServerChange(data: any) {
    switch (data.change_type) {
      case 'page':
        this.currentPage.set(data.current_page)
        this.tabsHisoryService.fetchHistory(data.current_page, this.searchForm.value).subscribe((res: HistoryAPIResponse) => {
          this.rows.set(res.result.items)
          this.loading = false
        });
        break;
      case 'sort':
        this.tabsHisoryService.fetchHistory(data.current_page, this.searchForm.value, data.sort_direction === "asc" ? 1 : 2, data.sort_column).subscribe((res: HistoryAPIResponse) => {
          this.rows.set(res.result.items)
          this.loading = false
        });
        break;
    }
  }
  ngOnDestroy() {
    // Prevent memory leaks
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
