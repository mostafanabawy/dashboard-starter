import { Component, Input, input, Signal, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-all-charts',
  templateUrl: './all-charts.component.html'
})
export class AllChartsComponent {
  constructor(
    private storeData: Store<any>
  ) {
    this.initStore();
  }
  ngOnInit() {
    this.initCharts();
  }
  initStore() {
    this.storeData
      .select((d) => d.index)
      .subscribe((d) => {
        this.store = d;
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data && this.data.length > 0) {
      this.initCharts();
    }
  }
  pieChart: any;
  columnChart: any;
  store: any;
  @Input() data: any[] = [];
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
    console.log(statusCountsArray);
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
    this.columnChart = {
      series: [
        {
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
        },
        {
          name: 'Revenue',
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
        },
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
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
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

  }
}