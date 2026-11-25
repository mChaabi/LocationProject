import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Car } from '../models/car';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/cars';

  // Signal pour un état réactif
  cars = signal<Car[]>([]);
  loaded = signal(false);

  getAllCars() {
  this.http.get<Car[]>(this.apiUrl).subscribe({
    next: d => { this.cars.set(d); this.loaded.set(true); },
    error: () => this.loaded.set(true)
  });
}

create(car: object) { return this.http.post(`${this.apiUrl}/add`, car).pipe(tap(() => this.getAllCars())); }
update(id: string, car: object) { return this.http.put(`${this.apiUrl}/${id}`, car).pipe(tap(() => this.getAllCars())); }
remove(id: string) { return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(tap(() => this.getAllCars())); }
getAvailable(debut: string, fin: string) {
  return this.http.get<Car[]>(`${this.apiUrl}/available`, { params: { debut, fin } });
}

}
