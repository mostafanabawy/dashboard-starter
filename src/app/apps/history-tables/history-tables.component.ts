import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HistoryService } from 'src/app/service/history.service';
import alasql from 'alasql';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HistoryAPIResponse } from 'src/app/types/history.types';
@Component({
  selector: 'app-history-tables',
  templateUrl: './history-tables.component.html'
})
export class HistoryTablesComponent implements OnInit {
  constructor(
    private tabsHisoryService: HistoryService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.initForm();
  }
  ngOnInit() {
    this.tabsHisoryService.fetchHistory(this.currentPage(), this.searchForm.value).subscribe((res: HistoryAPIResponse) => {
      this.rows.set(res.result.items);
      this.totalRows.set(res.result.PagingInfo[0].TotalRows);
      this.loading = false;
      console.log(res);
    });
    (window as any).XLSX = XLSX;
    this.translateCols();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.translateCols();
    });
  }
  search1 = '';
  cols: any[] = [];
  private langChangeSub!: Subscription;
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
      'table.Answer'
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
        { field: 'Answer', title: translations['table.Notes'], maxWidth: '10%' },
        { field: 'CreationDate', title: translations['table.Date'], maxWidth: '6%' },
        { field: 'ExtraField3', title: translations['table.Questions'], maxWidth: '10%' },
        { field: 'FollowUp', title: translations['table.FollowUp'], maxWidth: '6%' },
        { field: 'Answer', title: translations['table.Answer'], maxWidth: '5%' }
      ];
    });
  }

  rows = signal<any>([])
  searchForm!: FormGroup;
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRows = signal<number>(0);
  loading = true;
  initForm() {
    this.searchForm = this.fb.group({
      searchText: [''],
      searchBy: ['']
    });
  }

  onSearch() {
    this.loading = true;
    this.currentPage.set(1);
    this.tabsHisoryService.fetchHistory(this.currentPage(), this.searchForm.value).subscribe((res: any) => {
      this.rows.set(res.result.items);
      this.totalRows.set(res.result.PagingInfo[0].TotalRows);
      this.loading = false;
      console.log(res);
    });
  }
  exportData() {
    this.tabsHisoryService.fetchHistory(1, this.searchForm.value, 1, 'RecordId', 1000).subscribe((res: any) => {
      alasql('SELECT * INTO XLSX("History.xlsx",{headers:true}) FROM ?', [res.result.items]);
    });
  }
  onServerChange(data: any) {
    console.log(data);
    switch (data.change_type) {
      case 'page':
        this.currentPage.set(data.current_page)
        this.tabsHisoryService.fetchHistory(data.current_page, this.searchForm.value).subscribe((res: HistoryAPIResponse) => {
          this.rows.set(res.result.items)
          this.loading = false
          console.log(res);
        });
        break;
      case 'sort':
        this.tabsHisoryService.fetchHistory(data.current_page, this.searchForm.value, data.sort_direction === "asc" ? 1 : 2, data.sort_column).subscribe((res: HistoryAPIResponse) => {
          this.rows.set(res.result.items)
          this.loading = false
          console.log(res);
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
