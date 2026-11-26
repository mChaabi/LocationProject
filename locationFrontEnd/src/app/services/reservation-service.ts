import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reservation } from '../models/reservation';
import { Observable } from 'rxjs';
import { Loyalty, Quote } from '../models/pricing';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);

  // URL pointant vers votre backend local
  private apiUrl = 'http://localhost:8080/api/reservations';

  createReservation(reservation: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, reservation);
  }

  getUserReservations(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAll() {
    return this.http.get<any[]>(this.apiUrl);
  }
  setStatus(id: number, value: string) {
    return this.http.put(`${this.apiUrl}/${id}/status`, null, { params: { value } });
  }

  quote(
    carId: string,
    debut: string,
    fin: string,
    optionIds: number[],
    userId?: string,
    promo?: string,
  ) {
    const params: Record<string, string | string[]> = {
      carId,
      debut,
      fin,
      optionIds: optionIds.map(String),
    };
    if (userId) params['userId'] = userId;
    if (promo) params['promo'] = promo;
    return this.http.get<Quote>(`${this.apiUrl}/quote`, { params });
  }
  loyalty(userId: string) {
    return this.http.get<Loyalty>(`${this.apiUrl}/loyalty/${userId}`);
  }
  cancel(id: number, userId: string) {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, null, { params: { userId } });
  }
}
