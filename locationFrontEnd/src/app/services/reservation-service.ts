import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Reservation } from '../models/reservation';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.monsite.com/reservations';

  createReservation(reservation: Reservation) {
    return this.http.post(this.apiUrl, reservation);
  }
}
