import { Component, Input, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { HistoryService } from 'src/app/service/history.service';

@Component({
  selector: 'app-all-charts',
  templateUrl: './all-charts.component.html'
})
export class AllChartsComponent {
  constructor(
    private storeData: Store<any>,
    private tabsHistoryService: HistoryService
  ) {
    this.initStore();
  }
  ngOnInit() {
    this.storeData.dispatch({ type: 'toggleMainLoader', payload: true });
    this.tabsHistoryService.fetchHistory(1, { searchText: '', searchBy: 'PhoneNumber' }).subscribe((res) => {
      this.data = res.result.items;
      console.log('Fetched Data:', this.data);
      this.initCharts();
      this.storeData.dispatch({ type: 'toggleMainLoader', payload: false });
    });
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
  /* ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data && this.data.length > 0) {
      this.initCharts();
    }
  } */
  pieChart: any;
  columnChart: any;
  lineChart: any;
  store: any;
  data: any[] = [];

  initCharts() {
    /* pie chart */
    const labels = [
      'Follow Up',
      'Handled',
      'Call Dropped',
      'Abandoned',
      'Timeout',
      'Connection error',
      'No Answer'
    ];
    const statusCounts: { [key: string]: number } = {};
    labels.forEach(label => statusCounts[label] = 0);
    this.data.forEach(item => {
      const status = item.CallStatus;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });
    const statusCountsArray = Object.values(statusCounts);
    this.pieChart = {
      series: [...statusCountsArray],
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
      colors: ['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f', '#3dd598', '#ffb822'],
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
    const isRtl = this.store.rtlClass === 'rtl' ? true : false;
    const callerCounts: { [caller: string]: number } = {};
    this.data.forEach(item => {
      if (item.CallStatus === 'Follow Up') {
        const caller = item.CallerName;
        callerCounts[caller] = (callerCounts[caller] || 0) + 1;
      }
    });
    const callerNames = Object.keys(callerCounts);
    const counts = Object.values(callerCounts);
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

    this.lineChart = {
      series: [
        {
          name: 'Sales',
          data: [45, 55, 75, 25, 45, 110],
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
            return '$' + number;
          },
        },
        theme: 'light',
      },
      stroke: {
        width: 2,
        curve: 'smooth',
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'],
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
}