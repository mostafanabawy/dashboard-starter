import { Component } from '@angular/core';

@Component({
    selector: 'app-all-charts',
    templateUrl: './all-charts.component.html',
    standalone: false
})
export class AllChartsComponent {
  constructor() {
    this.initCharts();
  }
  pieChart: any;
  initCharts() {
    this.pieChart = {
      series: [44, 55, 13, 43, 22],
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
      labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
      colors: ['#4361ee', '#805dca', '#00ab55', '#e7515a', '#e2a03f'],
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
  }
}