import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HistoryService } from 'src/app/service/history.service';
import alasql from 'alasql';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
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
    this.tabsHisoryService.fetchHistory(this.currentPage(), this.searchForm.value).subscribe((res: any) => {
      this.rows.set(res.result.items);
      this.totalRows.set(res.result.PagingInfo[0].TotalRows);
      this.loading = false;
      console.log(res);
    });
    (window as any).XLSX = XLSX;
    this.translateCols();
  }
  search1 = '';
  cols = [
    { field: 'RecordId', title: 'RecordId', maxWidth: '6%' },
    { field: 'CallerName', title: 'Caller Name', maxWidth: '8%' },
    { field: 'PhoneNumber', title: 'Phone Number', maxWidth: '7%' },
    { field: 'WhatsAppNumber', title: 'Other Number', maxWidth: '7%' },
    { field: 'CallerType', title: 'Caller Type', maxWidth: '6%' },
    { field: 'ExtraField1', title: 'Type Of Call', maxWidth: '6%' },
    { field: 'CallStatus', title: 'Status', maxWidth: '5%' },
    { field: 'City', title: 'City', maxWidth: '6%' },
    { field: 'SchoolName', title: 'SchoolName', maxWidth: '10%' },
    { field: 'Percentage', title: 'Percentage', maxWidth: '5%' },
    { field: 'CertificateType', title: 'CertificateType', maxWidth: '7%' },
    { field: 'Answer', title: 'Notes', maxWidth: '10%' },
    { field: 'CreationDate', title: 'Date', maxWidth: '6%' },
    { field: 'ExtraField3', title: 'Questions', maxWidth: '10%' },
    { field: 'FollowUp', title: 'Follow Up', maxWidth: '6%' },
    { field: 'Answer', title: 'Answer', maxWidth: '5%' }
  ];
  translateCols() {
    this.cols = [
      { field: 'RecordId', title: this.translate.instant('table.RecordId'), maxWidth: '6%' },
      { field: 'CallerName', title: this.translate.instant('table.CallerName'), maxWidth: '8%' },
      { field: 'PhoneNumber', title: this.translate.instant('table.PhoneNumber'), maxWidth: '7%' },
      { field: 'WhatsAppNumber', title: this.translate.instant('table.OtherNumber'), maxWidth: '7%' },
      { field: 'CallerType', title: this.translate.instant('table.CallerType'), maxWidth: '6%' },
      { field: 'ExtraField1', title: this.translate.instant('table.TypeOfCall'), maxWidth: '6%' },
      { field: 'CallStatus', title: this.translate.instant('table.Status'), maxWidth: '5%' },
      { field: 'City', title: this.translate.instant('table.City'), maxWidth: '6%' },
      { field: 'SchoolName', title: this.translate.instant('table.SchoolName'), maxWidth: '10%' },
      { field: 'Percentage', title: this.translate.instant('table.Percentage'), maxWidth: '5%' },
      { field: 'CertificateType', title: this.translate.instant('table.CertificateType'), maxWidth: '7%' },
      { field: 'Answer', title: this.translate.instant('table.Notes'), maxWidth: '10%' },
      { field: 'CreationDate', title: this.translate.instant('table.Date'), maxWidth: '6%' },
      { field: 'ExtraField3', title: this.translate.instant('table.Questions'), maxWidth: '10%' },
      { field: 'FollowUp', title: this.translate.instant('table.FollowUp'), maxWidth: '6%' },
      { field: 'Answer', title: this.translate.instant('table.Answer'), maxWidth: '5%' }
    ];
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
    alasql('SELECT * INTO XLSX("History.xlsx",{headers:true}) FROM ?', [this.rows()]);

  }
  onServerChange(data: any) {
    console.log(data);
    switch (data.change_type) {
      case 'page':
        this.currentPage.set(data.current_page)
        this.tabsHisoryService.fetchHistory(data.current_page, this.searchForm.value).subscribe((res: any) => {
          this.rows.set(res.result.items)
          this.loading = false
          console.log(res);
        });
        break;
      case 'sort':
        this.tabsHisoryService.fetchHistory(data.current_page, this.searchForm.value, data.sort_direction === "asc"? 1 : 2, data.sort_column ).subscribe((res: any) => {
          this.rows.set(res.result.items)
          this.loading = false
          console.log(res);
        });
        break;
    }
  }
}
