import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { KPI, TeamCount } from '../models/kpi.model';

@Injectable({
  providedIn: 'root'
})
export class KpiService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getKPIs(): Observable<KPI[]> {
    return this.http.get<KPI[]>(`${this.API_URL}/kpis`);
  }

  getTeamCounts(): Observable<TeamCount[]> {
    return this.http.get<TeamCount[]>(`${this.API_URL}/team-counts`);
  }

  getKPIsByNWB(nwb: string): Observable<KPI[]> {
    return this.getKPIs().pipe(
      map(kpis => kpis.filter(kpi => kpi.nwb === nwb))
    );
  }

  getKPIsByTeam(team: string): Observable<KPI[]> {
    return this.getKPIs().pipe(
      map(kpis => kpis.filter(kpi => kpi.team === team))
    );
  }
}
