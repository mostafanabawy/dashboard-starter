import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import alasql from 'alasql';
import { FlatpickrDefaultsInterface } from 'angularx-flatpickr';
import { Subscription } from 'rxjs';
import { HistoryService } from 'src/app/service/history.service';
import { AppState } from 'src/app/types/auth.types';
import { ChartStatsResponse, HistoryAPIResponse, StatusDistributionItem } from 'src/app/types/history.types';
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
  dataListToExport: any[] = [];
  dataFromToForm!: FormGroup;
  cols: any[] = [];
  basic: FlatpickrDefaultsInterface;
  rows = signal<any[]>([]);
  partialPieChartDataFlag = false;
  partialColumnChartDataFlag = false;
  private langChangeSub!: Subscription;
  originalColumnColors!: string[];
  selectedColumnLabel: any;
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
      this.selectedLabel = this.data.StatusDistribution.reduce((acc: any, item: StatusDistributionItem) => {
        acc[item.CallStatus] = 1;
        return acc;
      }, {});
      this.selectedColumnLabel = this.data.FollowUpActivity.reduce((acc: any, item: any) => {
        acc[item.EnteredBy ? item.EnteredBy : 'Unknown'] = 1;
        return acc;
      }, {})
      this.initCharts();
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    });
    this.tabsHistoryService.fetchHistory(1, { DateFrom: this.dataFromToForm.value.StartDate, DateTo: this.dataFromToForm.value.EndDate }).subscribe((res: HistoryAPIResponse) => {
      this.dataListToExport = res.result.items;
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
  selectedLabel!: Record<string, any>;
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
        events: {
          legendClick: (chartContext: any, seriesIndex: any) => {
            const chart = chartContext;
            const clickedLabel = this.pieChart.labels[seriesIndex];
            //first click logic
            if (this.partialPieChartDataFlag === false) {
              for (const key in this.selectedLabel) {
                if (Object.prototype.hasOwnProperty.call(this.selectedLabel, key)) {
                  this.selectedLabel[key] = 0
                }
              }
              this.partialPieChartDataFlag = true;
            }
            if (this.selectedLabel[clickedLabel]) {
              this.selectedLabel[clickedLabel] = 0;
            } else {
              this.selectedLabel[clickedLabel] = 1;
            }
            //in case of undoing clicks
            let resetFlag = false;
            if (Object.values(this.selectedLabel as any).every(val => val === 0)) {
              resetFlag = true;
            }
            if (resetFlag) {
              for (const key in this.selectedLabel) {
                if (Object.prototype.hasOwnProperty.call(this.selectedLabel, key)) {
                  this.selectedLabel[key] = 1
                }
              }
              // Reset: Show all series
              this.pieChart.labels.forEach((label: any) => {
                chart.toggleSeries(label, true); // true to show
              });
              this.partialPieChartDataFlag = false;

              // Remove all custom styles from legend labels
              setTimeout(() => {
                const legendItems = document.querySelectorAll('.apexcharts-legend-text');
                legendItems.forEach((el: any) => {
                  el.style.fontWeight = '';
                  el.style.opacity = '';
                  el.style.textDecoration = '';
                });
              }, 0);
            } else {
              setTimeout(() => {
                const legendItems = document.querySelectorAll('.apexcharts-legend-text');
                legendItems.forEach((el: any) => {
                  const label = el.textContent?.trim();
                  if (label && this.selectedLabel[label]) {
                    el.style.fontWeight = 'bold';
                    el.style.opacity = '1';
                    el.style.textDecoration = 'underline'; // example visual cue
                  } else {
                    el.style.fontWeight = 'normal';
                    el.style.opacity = '0.5';
                    el.style.textDecoration = 'none';
                  }
                });
              }, 0);
            }
            return false; // prevent default toggle
          }
        },
        states: {
          normal: {
            filter: {
              type: 'none'
            }
          },
          active: {
            allowMultipleDataPointsSelection: true,
            filter: {
              type: 'none'
            }
          }
        }
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
    this.originalColumnColors = ['#805dca', '#e7515a'];
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
        events: {
          click: (event: any, chartContext: any, config: any) => {
            let barIndex = config.dataPointIndex;
            if (barIndex === -1) {
              const clickedLabel = (event.target as HTMLElement)?.textContent?.trim();
              if (clickedLabel && this.columnChart.xaxis.categories.includes(clickedLabel)) {
                barIndex = this.columnChart.xaxis.categories.indexOf(clickedLabel);
              } else {
                return; // still not a valid label or bar, exit early
              }
            }

            const categoryName = this.columnChart.xaxis.categories[barIndex];


            // First click logic: use partialColumnChartDataFlag to handle first time click
            if (this.partialColumnChartDataFlag === false) {
              for (const key in this.selectedColumnLabel) {
                if (Object.prototype.hasOwnProperty.call(this.selectedColumnLabel, key)) {
                  this.selectedColumnLabel[key] = 0;
                }
              }
              this.partialColumnChartDataFlag = true;
            }

            // Toggle the clicked column
            if (this.selectedColumnLabel[categoryName]) {
              this.selectedColumnLabel[categoryName] = 0;
            } else {
              this.selectedColumnLabel[categoryName] = 1;
            }

            // If all are now deselected, reset to all selected
            if (Object.values(this.selectedColumnLabel).every(val => val === 0)) {
              for (const key in this.selectedColumnLabel) {
                if (Object.prototype.hasOwnProperty.call(this.selectedColumnLabel, key)) {
                  this.selectedColumnLabel[key] = 1;
                }
              }
              this.partialColumnChartDataFlag = false;

              // Remove all custom styles from labels
              setTimeout(() => {
                const labelEls = document.querySelectorAll('#columnChartContainer .apexcharts-xaxis-label');
                labelEls.forEach((el: any) => {
                  el.style.fontWeight = '';
                  el.style.fill = '';
                });
              }, 0);
            } else {
              // Optionally, update chart visuals here if needed
              setTimeout(() => {
                const labelEls = document.querySelectorAll('#columnChartContainer .apexcharts-xaxis-label');
                labelEls.forEach((el: any) => {
                  const tspan = el.querySelector('tspan');
                  const label = tspan?.textContent?.trim();

                  if (label && this.selectedColumnLabel[label] === 1) {
                    el.style.fontWeight = 'bold';
                    el.style.fill = '#2d3f69'; // highlight
                  } else {
                    el.style.fontWeight = 'normal';
                    el.style.fill = '#888'; // default
                  }
                });
              }, 0);
            }
            console.log(this.selectedColumnLabel);
            return false; // prevent default toggle
          }
        }
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
      legend: {
        show: true,
        position: 'bottom'
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
      this.selectedLabel = this.data.StatusDistribution.reduce((acc: any, item: StatusDistributionItem) => {
        acc[item.CallStatus] = 1;
        return acc;
      }, {});
      this.tabsHistoryService.fetchHistory(1, { DateFrom: this.dataFromToForm.value.StartDate, DateTo: this.dataFromToForm.value.EndDate }).subscribe((res: HistoryAPIResponse) => {
        this.dataListToExport = res.result.items;
      })
      this.initCharts();
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    });
  }
  exportData(data: any, key: string) {
    let dataToExport!: any;
    switch (key) {
      case 'pie':
        dataToExport = Object.keys(this.selectedLabel).filter(key => this.selectedLabel[key] === 1);
        data = this.dataListToExport.filter((item: any) => {
          return dataToExport.includes(item.CallStatus)
        });
        break;
      case 'column':
        dataToExport = Object.keys(this.selectedColumnLabel).filter(key => this.selectedColumnLabel[key] === 1);
        data = this.dataListToExport.filter((item: any) => {
          // Condition 1: item.ExtraFiled2 is in dataToExport AND FollowUp is 'Need Answer'
          const condition1 = dataToExport.includes(item.ExtraFiled2) && item.FollowUp === 'Need Answer';

          // Condition 2: selectedColumnLabel['Unknown'] is 1 AND FollowUp is 'Need Answer'
          //             AND extrafiled2 is null, empty string, or undefined
          const condition2 = this.selectedColumnLabel['Unknown'] === 1 &&
            item.FollowUp === 'Need Answer' &&
            (item.ExtraFiled2 === null || item.ExtraFiled2 === '' || typeof item.ExtraFiled2 === 'undefined');

          return condition1 || condition2;
        });
        break;

      default:
        break;
    }

    alasql('SELECT * INTO XLSX("ChartsData.xlsx",{headers:true}) FROM ?', [data]);
  }
}