import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../models/contact';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private http = inject(HttpClient);

  sendMessage(contactData: Contact) {
    return this.http.post('https://api.monsite.com/contact', contactData);
  }
}
