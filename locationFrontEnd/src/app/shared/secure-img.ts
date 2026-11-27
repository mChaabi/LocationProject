import { Component, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { MediaService } from '../services/media-service';

@Component({
  selector: 'app-secure-img', standalone: true,
  template: `@if (src()) { <img [src]="src()!" [alt]="alt()"> } @else { <div class="sk"></div> }`,
  styles: [`
    :host { display:block; width:100%; height:100%; }
    img { width:100%; height:100%; object-fit:cover; animation:fadeIn .5s both; }
    .sk { width:100%; height:100%; background:linear-gradient(90deg,#eceef6 25%,#f6f7fb 50%,#eceef6 75%); background-size:200% 100%; animation:sh 1.4s infinite; }
    @keyframes sh { to { background-position:-200% 0; } }
  `]
})
export class SecureImgComponent implements OnInit, OnDestroy {
  private media = inject(MediaService);
  id = input.required<string>();
  alt = input('');
  src = signal<string | null>(null);

  ngOnInit() { this.media.blob(this.id()).subscribe(b => this.src.set(URL.createObjectURL(b))); }
  ngOnDestroy() { const s = this.src(); if (s) URL.revokeObjectURL(s); }
}