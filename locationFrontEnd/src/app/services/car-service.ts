import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Car } from '../models/car';

@Injectable({ providedIn: 'root' })
export class CarService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/cars';

  // Signal pour un état réactif
  cars = signal<Car[]>([]);

  getAllCars() {
    this.http.get<Car[]>(this.apiUrl).subscribe(data => {
      this.cars.set(data);
    });
  }

}
