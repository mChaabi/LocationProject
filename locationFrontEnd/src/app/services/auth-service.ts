import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  register(userData: Partial<User>) {
    return this.http.post<User>('https://api.monsite.com/register', userData);
  }

  // Bonus : Simulation de déconnexion
  logout() {
    this.currentUser.set(null);
  }
}
