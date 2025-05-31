import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import alasql from 'alasql';
import { FlatpickrDefaultsInterface } from 'angularx-flatpickr';
import { Subscription } from 'rxjs';
import { HistoryService } from 'src/app/service/history.service';
import { AppState } from 'src/app/types/auth.types';
import { CaseTrendItem, ChartStatsResponse, FollowUpActivityItem, StatusDistributionItem } from 'src/app/types/history.types';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-all-charts',
  templateUrl: './all-charts.component.html'
})
export class AllChartsComponent {
  pieChart: any;
  columnChart: any;
  lineChart: any;
  store!: AppState;
  data!: ChartStatsResponse;
  dataFromToForm!: FormGroup;
  cols: any[] = [];
  basic: FlatpickrDefaultsInterface;
  rows = signal<any[]>([]);
  private langChangeSub!: Subscription;
  constructor(
    private storeData: Store<AppState>,
    private tabsHistoryService: HistoryService,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.initStore();
    this.basic = {
      dateFormat: 'Y-m-d',
      // position: this.store.rtlClass === 'rtl' ? 'auto right' : 'auto left',
      monthSelectorType: 'dropdown'
    };
    this.initForm();
  }
  ngOnInit() {
    this.storeData.dispatch({ type: 'toggleMainLoader', payload: true });
    this.tabsHistoryService.getChartsData(this.dataFromToForm.value).subscribe((res) => {
      this.data = res;
      this.rows.set(this.data.CaseTrends);
      this.initCharts();
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    });
    this.translateCols();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.translateCols();
    });
    (window as any).XLSX = XLSX;
  }
  initStore() {
    this.storeData
      .select((d) => ({
        index: d.index,
        auth: d.auth
      }))
      .subscribe((d) => {
        this.store = d;
      });
  }

  initForm() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date: Date): string =>
      date.toISOString().slice(0, 10); // returns YYYY-MM-DD

    this.dataFromToForm = this.fb.group({
      StartDate: [formatDate(thirtyDaysAgo)],
      EndDate: [formatDate(today)]
    });
  }

  translateCols() {
    const keys = [
      'table3.Day',
      'table3.Cases'
    ];

    this.translate.get(keys).subscribe(translations => {
      this.cols = [
        { field: 'Day', title: translations['table3.Day'] },
        { field: 'CasesLogged', title: translations['table3.Cases'] }
      ];
    });
  }

  initCharts() {
    /* pie chart */
    const labels = this.data.StatusDistribution.map((item) => {
      return item.CallStatus
    })
    const statusCounts = this.data.StatusDistribution.map((item) => {
      return item.Total
    })


    this.pieChart = {
      series: [...statusCounts],
      chart: {
        height: 300,
        type: 'pie',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      labels: labels,
      // Muted, distinct, non-rainbow palette with clear contrast
      colors: [
        '#4361ee', // blue
        '#e7515a', // red
        '#6c757d', // gray
        '#e2a03f', // gold
        '#00ab55', // green
        '#2e3a59', // dark blue
        '#b47aea', // muted violet
        '#f7b267'  // muted orange
      ],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
          },
        },
      ],
      stroke: {
        show: false,
      },
      legend: {
        position: 'bottom',
      },
    };

    /* column chart */
    const isRtl = this.store.index.rtlClass === 'rtl' ? true : false;
    const callerNames = this.data.FollowUpActivity.map(item => item.EnteredBy || 'Unknown');
    const counts = this.data.FollowUpActivity.map(item => item.PendingFollowUps || 0);
    this.columnChart = {
      series: [
        {
          name: 'Agent',
          data: [...counts]
        }
      ],
      chart: {
        height: 300,
        type: 'bar',
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ['#805dca', '#e7515a'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      grid: {
        borderColor: '#e0e6ed',
      },
      xaxis: {
        categories: [...callerNames],
        axisBorder: {
          color: '#e0e6ed',
        },
      },
      yaxis: {
        opposite: isRtl ? true : false,
        labels: {
          offsetX: isRtl ? -10 : 0,
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val: any) {
            return val;
          },
        },
      },
    };

    /* line chart */

    const days = this.data.CaseTrends.map(item => item.Day);
    const casesLogged = this.data.CaseTrends.map(item => item.CasesLogged || 0);
    this.lineChart = {
      series: [
        {
          name: 'Cases',
          data: [...casesLogged]
        },
      ],
      chart: {
        height: 300,
        type: 'line',
        toolbar: false,
      },
      colors: ['#4361ee'],
      tooltip: {
        marker: false,
        y: {
          formatter(number: string) {
            return number;
          },
        },
        theme: 'light',
      },
      stroke: {
        width: 2,
        curve: 'smooth',
      },
      xaxis: {
        categories: [...days],
        axisBorder: {
          color: '#e0e6ed',
        },
      },
      yaxis: {
        opposite: isRtl ? true : false,
        labels: {
          offsetX: isRtl ? -20 : 0,
        },
      },
      grid: {
        borderColor: '#e0e6ed'
      },
    };
  }
  onSearch() {
    this.storeData.dispatch({ type: 'toggleMainLoader', payload: true });
    this.tabsHistoryService.getChartsData(this.dataFromToForm.value).subscribe((res) => {
      this.data = res;
      this.rows.set(this.data.CaseTrends);
      this.initCharts();
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    });
  }
  exportData(data: CaseTrendItem[] | FollowUpActivityItem[] | StatusDistributionItem[]) {

    alasql('SELECT * INTO XLSX("ChartsData.xlsx",{headers:true}) FROM ?', [data]);
  }
}