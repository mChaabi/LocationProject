import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/users';
  all() { return this.http.get<User[]>(this.api); }
  byId(id: string) { return this.http.get<User>(`${this.api}/${id}`); }
}