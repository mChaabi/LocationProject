import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../models/contact';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);
// L'URL doit correspondre exactement au backend
  private apiUrl = 'http://localhost:8080/api/contacts/send';

  sendContact(contactData: any): Observable<any> {
    return this.http.post(this.apiUrl, contactData);
  }
}
