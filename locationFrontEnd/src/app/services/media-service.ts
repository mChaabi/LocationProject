import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MediaItem, Review } from '../models/media';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8080/api/media';

  url(id: string) { return `${this.api}/${id}/content`; }          // public media (car photos)
  blob(id: string) { return this.http.get(`${this.api}/${id}/content`, { responseType: 'blob' }); }
  list(ownerType: string, ownerId: string) {
    return this.http.get<MediaItem[]>(this.api, { params: { ownerType, ownerId } });
  }
  upload(file: File, ownerType: string, ownerId: string, kind: string) {
    const body = new FormData();
    body.append('file', file); body.append('ownerType', ownerType);
    body.append('ownerId', ownerId); body.append('kind', kind);
    return this.http.post<MediaItem>(this.api, body, { reportProgress: true, observe: 'events' });
  }
  review(id: string, value: Review) { return this.http.put<MediaItem>(`${this.api}/${id}/review`, null, { params: { value } }); }
  remove(id: string) { return this.http.delete<void>(`${this.api}/${id}`); }
}