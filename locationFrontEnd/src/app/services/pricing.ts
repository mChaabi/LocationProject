import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Promo, Rule, Rules } from '../models/pricing';

@Injectable({ providedIn: 'root' })
export class PricingService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  rules = signal<Rules | null>(null);
  promos = signal<Promo[]>([]);

  loadRules() { this.http.get<Rules>(`${this.api}/pricing/rules`).subscribe(r => this.rules.set(r)); }
  saveRule(r: Partial<Rule>) {
    const url = `${this.api}/pricing/rules`;
    return (r.id ? this.http.put(`${url}/${r.id}`, r) : this.http.post(url, r)).pipe(tap(() => this.loadRules()));
  }
  removeRule(id: number) { return this.http.delete(`${this.api}/pricing/rules/${id}`).pipe(tap(() => this.loadRules())); }

  loadPromos() { this.http.get<Promo[]>(`${this.api}/promos`).subscribe(p => this.promos.set(p)); }
  savePromo(p: Partial<Promo>) {
    const url = `${this.api}/promos`;
    return (p.id ? this.http.put(`${url}/${p.id}`, p) : this.http.post(url, p)).pipe(tap(() => this.loadPromos()));
  }
  removePromo(id: number) { return this.http.delete(`${this.api}/promos/${id}`).pipe(tap(() => this.loadPromos())); }
}