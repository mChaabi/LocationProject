import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ExtraOption } from '../models/ExtraOption';


@Injectable({ providedIn: 'root' })
export class OptionService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/options';
  options = signal<ExtraOption[]>([]);

  load() { this.http.get<ExtraOption[]>(this.api).subscribe(o => this.options.set(o)); }
  create(o: object) { return this.http.post(this.api, o).pipe(tap(() => this.load())); }
  remove(id: number) { return this.http.delete(`${this.api}/${id}`).pipe(tap(() => this.load())); }
}