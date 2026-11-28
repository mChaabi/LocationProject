import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api';

  currentUser = signal<User | null>(this.restore());

  private restore(): User | null {
    try {
      return JSON.parse(localStorage.getItem('user') ?? 'null');
    } catch {
      return null;
    }
  }

  isAdmin = computed(() => this.currentUser()?.role?.toLowerCase() === 'admin');
  register(data: object) {
    return this.http.post<User>(`${this.api}/users/register`, data);
  }
  login(email: string, password: string) {
    return this.http.post<User>(`${this.api}/auth/login`, { email, password }).pipe(
      tap((u) => {
        this.currentUser.set(u);
        localStorage.setItem('user', JSON.stringify(u));
      }),
    );
  }
  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('user');
  }
}
