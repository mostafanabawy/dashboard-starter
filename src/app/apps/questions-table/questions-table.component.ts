import { Component, effect, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from 'src/app/service/history.service';
import { QuestionsAPIResponse } from 'src/app/types/questions.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-questions-table',
  templateUrl: './questions-table.component.html',
  standalone: false
})
export class QuestionsTableComponent {
  constructor(
    private tabsHisoryService: HistoryService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.initForm();
  }



  ngOnInit() {
    this.tabsHisoryService.fetchQuestions(1, this.searchForm.value).subscribe((res: QuestionsAPIResponse) => {
      this.rows.set(res.result.items)
      this.totalRows.set(res.result.PagingInfo[0].TotalRows);
      this.currentPage.set(res.result.PagingInfo[0].CurrentPage);
      this.loading = false;
      console.log(res);
    });
    this.translateCols();
    this.translate.onLangChange.subscribe(() => {
      this.translateCols(); // Re-translate when language changes
    });
  }
  loading = true;
  cols: any[] = [];
  translateCols() {
    this.translate.get([
      'table2.Question',
      'table2.Answer',
      'table2.Notes',
      'table2.Action'
    ]).subscribe(translations => {
      this.cols = [
        { field: 'Question', title: translations['table2.Question'] },
        { field: 'AnswerEN', title: translations['table2.Answer'] },
        { field: 'AnswerAR', title: translations['table2.Notes'] },
        { field: 'action', title: translations['table2.Action'], filter: false, headerClass: 'justify-center' }
      ];
    });
  }

  rows = signal<any>([])
  singleRowForm!: FormGroup;
  searchForm!: FormGroup;
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRows = signal<number>(0);
  initForm() {
    this.singleRowForm = this.fb.group({
      ID: [{ value: "" }],
      Question: [''],
      AnswerEN: [''],
      AnswerAR: ['']
    });
    this.searchForm = this.fb.group({
      searchText: [''],
      searchBy: ['']
    });

  }


  editRow(row: any) {
    console.log(row);
    this.singleRowForm.patchValue({
      ID: row.ID,
      Question: row.Question,
      AnswerEN: row.AnswerEN,
      AnswerAR: row.AnswerAR
    });
  }
  onEdit(modal20: any) {
    console.log(this.singleRowForm.value);
    this.tabsHisoryService.editRowFormData(this.singleRowForm.value).subscribe((res: any) => {
      const toast: any = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        customClass: { container: 'toast' },
      });
      toast.fire({
        icon: 'success',
        title: "row updated successfully",
        padding: '10px 20px',
      });
      this.loading = true;
      modal20.close();
      this.tabsHisoryService.fetchQuestions(1, this.searchForm.value).subscribe((res: QuestionsAPIResponse) => {
        this.rows.set(res.result.items);
        if (res.result.items.length > 0) {
          this.totalRows.set(res.result.PagingInfo[0].TotalRows + 1);
        } else {
          this.totalRows.set(res.result.PagingInfo[0].TotalRows);
        }
        this.loading = false
        console.log(res);
      });
    });
  }
  openAddForm(modal21: any) {
    this.singleRowForm.reset();
    this.singleRowForm.patchValue({
      questionId: "",
      question: "",
      answer: "",
      notes: ""
    });
    modal21.open();
  }
  onAdd(modal21: any) {
    this.tabsHisoryService.addRowFormData(this.singleRowForm.value).subscribe((res: any) => {
      const toast: any = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        customClass: { container: 'toast' },
      });
      toast.fire({
        icon: 'success',
        title: "row added successfully",
        padding: '10px 20px',
      });
      this.loading = true;
      modal21.close();
      this.tabsHisoryService.fetchQuestions(1, this.searchForm.value).subscribe((res: QuestionsAPIResponse) => {
        this.rows.set(res.result.items);
        if (res.result.items.length > 0) {
          this.totalRows.set(res.result.PagingInfo[0].TotalRows + 1);
        } else {
          this.totalRows.set(res.result.PagingInfo[0].TotalRows);
        }
        this.loading = false
        console.log(res);
      });
    });
  }
  onPageChange(event: any) {
    this.currentPage.set(event)
  }
  onSearchSubmit() {
    this.loading = true;
    this.currentPage.set(1);
    this.tabsHisoryService.fetchQuestions(this.currentPage(), this.searchForm.value).subscribe((res: QuestionsAPIResponse) => {
      this.rows.set(res.result.items);
      if (res.result.items.length > 0) {
        this.totalRows.set(res.result.PagingInfo[0].TotalRows + 1);
      } else {
        this.totalRows.set(res.result.PagingInfo[0].TotalRows);
      }
      this.loading = false
      console.log(res);
    });
  }
}
