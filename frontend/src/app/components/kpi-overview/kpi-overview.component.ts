import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../services/kpi.service';
import { KPI } from '../../models/kpi.model';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-kpi-overview',
  templateUrl: './kpi-overview.component.html',
  styleUrls: ['./kpi-overview.component.scss']
})
export class KpiOverviewComponent implements OnInit {
  kpis: KPI[] = [];
  selectedNWB: string = 'RBRO';
  deploymentChart: any;
  failureRateChart: any;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.kpiService.getKPIsByNWB(this.selectedNWB).subscribe(data => {
      this.kpis = data;
      this.updateCharts();
    });
  }

  updateCharts(): void {
    const quarters = [...new Set(this.kpis.map(kpi => `${kpi.quarter} ${kpi.year}`))];
    const deploymentData = quarters.map(q => {
      const qKpis = this.kpis.filter(kpi => `${kpi.quarter} ${kpi.year}` === q);
      return qKpis.reduce((sum, kpi) => sum + kpi.deploymentFrequency, 0) / qKpis.length;
    });

    const failureData = quarters.map(q => {
      const qKpis = this.kpis.filter(kpi => `${kpi.quarter} ${kpi.year}` === q);
      return qKpis.reduce((sum, kpi) => sum + kpi.changeFailureRate, 0) / qKpis.length;
    });

    this.createDeploymentChart(quarters, deploymentData);
    this.createFailureRateChart(quarters, failureData);
  }

  private createDeploymentChart(labels: string[], data: number[]): void {
    if (this.deploymentChart) {
      this.deploymentChart.destroy();
    }

    this.deploymentChart = new Chart('deploymentChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Deployment Frequency',
          data,
          borderColor: '#4CAF50',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  private createFailureRateChart(labels: string[], data: number[]): void {
    if (this.failureRateChart) {
      this.failureRateChart.destroy();
    }

    this.failureRateChart = new Chart('failureRateChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Change Failure Rate',
          data,
          borderColor: '#F44336',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  onNWBChange(nwb: string): void {
    this.selectedNWB = nwb;
    this.loadKPIs();
  }
}
