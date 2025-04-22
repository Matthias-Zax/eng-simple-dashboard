import { Component, OnInit } from '@angular/core';
import { KpiService } from '../../services/kpi.service';
import { KPI } from '../../models/kpi.model';
import { Chart } from 'chart.js/auto';

type TrendRow = { team: string; product: string; value: number };

@Component({
  selector: 'app-kpi-overview',
  templateUrl: './kpi-overview.component.html',
  styleUrls: ['./kpi-overview.component.scss']
})
export class KpiOverviewComponent implements OnInit {
  showRawData: boolean = false;
  get rawKpiJson(): string {
    return JSON.stringify(this.kpis, null, 2);
  }
  kpis: KPI[] = [];
  selectedNWB: string = 'RBRO';
  selectedPeriod: string = '';
  deploymentChart: any;
  failureRateChart: any;

  get periods(): string[] {
    return [...new Set(this.kpis.map(kpi => `${kpi.year} ${kpi.quarter}`))];
  }

  get filteredKpis(): KPI[] {
    if (!this.selectedPeriod) return this.kpis;
    const [year, quarter] = this.selectedPeriod.split(' ');
    return this.kpis.filter(kpi => String(kpi.year) === year && String(kpi.quarter) === quarter);
  }

  get totalTeams(): number {
    // Unique teams with a non-empty name in the filtered set
    return new Set(this.filteredKpis.map(kpi => kpi.team).filter(t => t)).size;
  }

  // --- Sorting and Filtering State ---
  deploymentSortKey: string = 'value';
  deploymentSortDir: 'asc' | 'desc' = 'desc';
  deploymentFilter: string = '';

  cycleSortKey: string = 'value';
  cycleSortDir: 'asc' | 'desc' = 'desc';
  cycleFilter: string = '';

  mttrSortKey: string = 'value';
  mttrSortDir: 'asc' | 'desc' = 'desc';
  mttrFilter: string = '';

  testAutoSortKey: string = 'value';
  testAutoSortDir: 'asc' | 'desc' = 'desc';
  testAutoFilter: string = '';

  // --- Trend Table Data (arrays, not getters) ---
  deploymentFrequencyTrend: TrendRow[] = [];
  cycleTimeTrend: TrendRow[] = [];
  mttrTrend: TrendRow[] = [];
  testAutomationTrend: TrendRow[] = [];

  private getTrendValue(row: TrendRow, key: string): string | number {
    if (key === 'team') return row.team;
    if (key === 'product') return row.product;
    return row.value;
  }

  updateTrends() {
    // Deployment Frequency
    let deploymentRows = this.filteredKpis.map(kpi => ({
      team: kpi.team,
      product: kpi.product,
      value: kpi.deploymentFrequency
    }));
    if (this.deploymentFilter) {
      deploymentRows = deploymentRows.filter(row =>
        (row.team?.toLowerCase().includes(this.deploymentFilter.toLowerCase()) ||
         row.product?.toLowerCase().includes(this.deploymentFilter.toLowerCase()))
      );
    }
    deploymentRows = deploymentRows.sort((a, b) => {
      const valA = this.getTrendValue(a, this.deploymentSortKey);
      const valB = this.getTrendValue(b, this.deploymentSortKey);
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return this.deploymentSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.deploymentSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    this.deploymentFrequencyTrend = deploymentRows;

    // Cycle Time
    let cycleRows = this.filteredKpis.map(kpi => ({
      team: kpi.team,
      product: kpi.product,
      value: kpi.cycleTime
    }));
    if (this.cycleFilter) {
      cycleRows = cycleRows.filter(row =>
        (row.team?.toLowerCase().includes(this.cycleFilter.toLowerCase()) ||
         row.product?.toLowerCase().includes(this.cycleFilter.toLowerCase()))
      );
    }
    cycleRows = cycleRows.sort((a, b) => {
      const valA = this.getTrendValue(a, this.cycleSortKey);
      const valB = this.getTrendValue(b, this.cycleSortKey);
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return this.cycleSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.cycleSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    this.cycleTimeTrend = cycleRows;

    // MTTR
    let mttrRows = this.filteredKpis.map(kpi => ({
      team: kpi.team,
      product: kpi.product,
      value: kpi.mttr
    }));
    if (this.mttrFilter) {
      mttrRows = mttrRows.filter(row =>
        (row.team?.toLowerCase().includes(this.mttrFilter.toLowerCase()) ||
         row.product?.toLowerCase().includes(this.mttrFilter.toLowerCase()))
      );
    }
    mttrRows = mttrRows.sort((a, b) => {
      const valA = this.getTrendValue(a, this.mttrSortKey);
      const valB = this.getTrendValue(b, this.mttrSortKey);
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return this.mttrSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.mttrSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    this.mttrTrend = mttrRows;

    // Test Automation
    let testAutoRows = this.filteredKpis.map(kpi => ({
      team: kpi.team,
      product: kpi.product,
      value: kpi.testAutomation
    }));
    if (this.testAutoFilter) {
      testAutoRows = testAutoRows.filter(row =>
        (row.team?.toLowerCase().includes(this.testAutoFilter.toLowerCase()) ||
         row.product?.toLowerCase().includes(this.testAutoFilter.toLowerCase()))
      );
    }
    testAutoRows = testAutoRows.sort((a, b) => {
      const valA = this.getTrendValue(a, this.testAutoSortKey);
      const valB = this.getTrendValue(b, this.testAutoSortKey);
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return this.testAutoSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return this.testAutoSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    this.testAutomationTrend = testAutoRows;
  }

  // --- Methods to update sort and filter ---
  setDeploymentSort(key: string) {
    if (this.deploymentSortKey === key) {
      this.deploymentSortDir = this.deploymentSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.deploymentSortKey = key;
      this.deploymentSortDir = 'desc';
    }
    this.updateTrends();
  }
  setCycleSort(key: string) {
    if (this.cycleSortKey === key) {
      this.cycleSortDir = this.cycleSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.cycleSortKey = key;
      this.cycleSortDir = 'desc';
    }
    this.updateTrends();
  }
  setMttrSort(key: string) {
    if (this.mttrSortKey === key) {
      this.mttrSortDir = this.mttrSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.mttrSortKey = key;
      this.mttrSortDir = 'desc';
    }
    this.updateTrends();
  }
  setTestAutoSort(key: string) {
    if (this.testAutoSortKey === key) {
      this.testAutoSortDir = this.testAutoSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.testAutoSortKey = key;
      this.testAutoSortDir = 'desc';
    }
    this.updateTrends();
  }

  selectedTab: 'overview' | 'trends' | 'allkpis' = 'overview';

  onTabChange(tab: 'overview' | 'trends' | 'allkpis') {
    this.selectedTab = tab;
    if (tab === 'overview') {
      setTimeout(() => this.updateCharts(), 0); // Ensure canvas is in DOM
    }
  }

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    this.loadKPIs();
  }

  // Update trends after KPIs load
  loadKPIs(): void {
    this.kpiService.getKPIsByNWB(this.selectedNWB).subscribe(data => {
      // Parse all numeric fields as numbers
      this.kpis = data.map(kpi => ({
        ...kpi,
        deploymentFrequency: Number(kpi.deploymentFrequency),
        cycleTime: Number(kpi.cycleTime),
        changeFailureRate: Number(kpi.changeFailureRate),
        mttr: Number(kpi.mttr),
        cicdPipeline: Number(kpi.cicdPipeline),
        testAutomation: Number(kpi.testAutomation),
        devOpsScore: Number(kpi.devOpsScore),
      }));
      this.updateTrends();
      this.updateCharts();
    });
  }

  // Update trends after period change
  onPeriodChange() {
    this.updateTrends();
  }

  // Filtering handlers for each trend table
  onDeploymentFilterChange() {
    this.updateTrends();
  }
  onCycleFilterChange() {
    this.updateTrends();
  }
  onMttrFilterChange() {
    this.updateTrends();
  }
  onTestAutoFilterChange() {
    this.updateTrends();
  }



  updateCharts(): void {
    const quarters = [...new Set(this.kpis.map(kpi => `${kpi.quarter} ${kpi.year}`))];
    const deploymentData = quarters.map(q => {
      const qKpis = this.kpis.filter(kpi => `${kpi.quarter} ${kpi.year}` === q);
      // Only use valid numbers for deploymentFrequency
      const valid = qKpis.map(kpi => Number(kpi.deploymentFrequency)).filter(val => Number.isFinite(val));
      return valid.length > 0 ? valid.reduce((sum, val) => sum + val, 0) / valid.length : 0;
    });
    // Calculate total reported products per quarter
    const totalProducts = quarters.map(q => {
      const qKpis = this.kpis.filter(kpi => `${kpi.quarter} ${kpi.year}` === q);
      // Count unique products
      const uniqueProducts = new Set(qKpis.map(kpi => kpi.product));
      return uniqueProducts.size;
    });
    console.log('Quarters:', quarters);
    console.log('Deployment Data:', deploymentData);
    console.log('Total Products:', totalProducts);
    console.log('KPIs:', this.kpis);

    const failureData = quarters.map(q => {
      const qKpis = this.kpis.filter(kpi => `${kpi.quarter} ${kpi.year}` === q);
      return qKpis.reduce((sum, kpi) => sum + kpi.changeFailureRate, 0) / qKpis.length;
    });

    this.createDeploymentChart(quarters, deploymentData, totalProducts);
    this.createFailureRateChart(quarters, failureData);
  }

  private createDeploymentChart(labels: string[], data: number[], totalProducts: number[]): void {
    if (this.deploymentChart) {
      this.deploymentChart.destroy();
    }

    this.deploymentChart = new Chart('deploymentChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'line',
            label: 'Deployment Frequency',
            data: data,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: false,
            yAxisID: 'y',
            tension: 0.1
          },
          {
            type: 'bar',
            label: 'Total Reported Products',
            data: totalProducts,
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Deployment Frequency' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Total Reported Products' }
          }
        }
      }
    });
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
