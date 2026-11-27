import { Component, OnDestroy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MediaService } from '../services/media-service';
import { MediaItem } from '../models/media';

@Component({
  selector: 'app-doc-viewer', standalone: true,
  template: `
    <div class="overlay" (click)="closed.emit()">
      <div class="box" (click)="$event.stopPropagation()">
        <header><b>{{ item().name }}</b><button (click)="closed.emit()" aria-label="Fermer">✕</button></header>
        @if (!raw()) { <div class="wait">Chargement…</div> }
        @else if (item().contentType === 'application/pdf') { <iframe [src]="safe()!" title="Document"></iframe> }
        @else { <img [src]="raw()!" [alt]="item().name"> }
      </div>
    </div>`,
  styles: [`
    .overlay { position:fixed; inset:0; z-index:3000; display:grid; place-items:center; padding:24px; background:rgba(11,18,32,.8); backdrop-filter:blur(6px); animation:fadeIn .25s both; }
    .box { width:min(980px,100%); max-height:100%; display:flex; flex-direction:column; background:#fff; border-radius:20px; overflow:hidden; animation:zoom .4s var(--ease) both; }
    @keyframes zoom { from { opacity:0; transform:scale(.9); } }
    header { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--line); }
    header button { border:0; background:var(--bg); width:36px; height:36px; border-radius:10px; cursor:pointer; }
    img { max-width:100%; max-height:78vh; margin:auto; object-fit:contain; } iframe { width:100%; height:78vh; border:0; }
    .wait { padding:80px; text-align:center; color:var(--muted); }
  `]
})
export class DocViewerComponent implements OnInit, OnDestroy {
  private media = inject(MediaService);
  private sanitizer = inject(DomSanitizer);
  item = input.required<MediaItem>();
  closed = output<void>();
  raw = signal<string | null>(null);
  safe = computed(() => { const r = this.raw(); return r ? this.sanitizer.bypassSecurityTrustResourceUrl(r) : null; });

  ngOnInit() { this.media.blob(this.item().id).subscribe(b => this.raw.set(URL.createObjectURL(b))); }
  ngOnDestroy() { const r = this.raw(); if (r) URL.revokeObjectURL(r); }
}