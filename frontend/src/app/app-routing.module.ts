import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KpiOverviewComponent } from './components/kpi-overview/kpi-overview.component';

const routes: Routes = [
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: 'overview', component: KpiOverviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
