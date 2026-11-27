import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MediaService } from '../services/media-service';
import { MediaItem, MediaKind, Review } from '../models/media';
import { UploaderComponent } from './uploader';
import { SecureImgComponent } from './secure-img';
import { DocViewerComponent } from './doc-viewer';

@Component({
  selector: 'app-client-docs', standalone: true,
  imports: [UploaderComponent, SecureImgComponent, DocViewerComponent],
  template: `
    <div class="slots">
      @for (s of slots; track s.kind; let i = $index) {
        <section class="slot" [style.--i]="i">
          <header><span class="ico">{{ s.icon }}</span><div><b>{{ s.title }}</b><small>{{ s.hint }}</small></div></header>

          <div class="files">
            @for (m of by()[s.kind]; track m.id) {
              <article class="file">
                <button class="thumb" (click)="viewing.set(m)" [attr.aria-label]="'Ouvrir ' + m.name">
                  @if (m.contentType === 'application/pdf') { <span>📄</span> } @else { <app-secure-img [id]="m.id" [alt]="m.name" /> }
                </button>
                <div class="grow"><span class="name">{{ m.name }}</span><span [class]="'st ' + m.review">{{ label[m.review] }}</span></div>
                @if (mode() === 'admin') {
                  <button class="ok" (click)="setReview(m, 'VERIFIED')" [disabled]="m.review === 'VERIFIED'" title="Valider">✓</button>
                  <button class="no" (click)="setReview(m, 'REJECTED')" [disabled]="m.review === 'REJECTED'" title="Refuser">✕</button>
                } @else {
                  <button class="del" (click)="remove(m)" title="Supprimer">🗑️</button>
                }
              </article>
            } @empty { <p class="none">Aucun document envoyé</p> }
          </div>

          @if (mode() === 'client') {
            <app-uploader ownerType="USER" [ownerId]="userId()" [kind]="s.kind" icon="📎"
              accept="image/*,application/pdf" label="Ajouter un fichier" hint="Image ou PDF · 10 Mo max"
              (uploaded)="added($event)" />
          }
        </section>
      }
    </div>
    @if (viewing(); as v) { <app-doc-viewer [item]="v" (closed)="viewing.set(null)" /> }`,
  styles: [`
    .slots { display:grid; gap:18px; }
    .slot { background:var(--card); border:1px solid var(--line); border-radius:18px; padding:20px; animation:fadeUp .6s var(--ease) backwards; animation-delay:calc(var(--i) * 100ms); }
    .slot > header { display:flex; gap:14px; align-items:center; margin-bottom:14px; } .slot small { display:block; color:var(--muted); }
    .ico { width:46px; height:46px; display:grid; place-items:center; font-size:1.4rem; border-radius:14px; background:#eef2ff; }
    .files { display:grid; gap:10px; margin-bottom:14px; }
    .file { display:flex; align-items:center; gap:12px; padding:10px; border:1px solid var(--line); border-radius:14px; animation:fadeUp .4s var(--ease) backwards; }
    .thumb { width:72px; height:54px; padding:0; border:0; border-radius:10px; overflow:hidden; cursor:zoom-in; background:#eef2ff; display:grid; place-items:center; font-size:1.4rem; transition:transform .3s var(--ease); }
    .thumb:hover { transform:scale(1.06); }
    .grow { flex:1; min-width:0; display:grid; gap:4px; justify-items:start; } .name { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:.85rem; }
    .none { color:var(--muted); font-size:.85rem; margin:0; }
    .ok, .no, .del { width:36px; height:36px; border:0; border-radius:10px; cursor:pointer; font-weight:700; transition:transform .25s var(--ease); }
    .ok { background:#d1fae5; color:#047857; } .no { background:#fee2e2; color:#b91c1c; } .del { background:var(--bg); }
    .ok:hover:not(:disabled), .no:hover:not(:disabled), .del:hover { transform:scale(1.12); } button:disabled { opacity:.35; cursor:default; }
  `]
})
export class ClientDocsComponent {
  private media = inject(MediaService);

  userId = input.required<string>();
  mode = input<'admin' | 'client'>('client');
  itemsChange = output<MediaItem[]>();

  items = signal<MediaItem[]>([]);
  viewing = signal<MediaItem | null>(null);
  label: Record<Review, string> = { PENDING: 'En vérification', VERIFIED: 'Vérifié', REJECTED: 'Refusé' };
  slots: { kind: MediaKind; title: string; icon: string; hint: string }[] = [
    { kind: 'LICENSE', title: 'Permis de conduire', icon: '🪪', hint: 'Recto et verso, photo nette' },
    { kind: 'ID_CARD', title: 'Pièce d’identité / passeport', icon: '🛂', hint: 'Image ou PDF' }
  ];
  by = computed<Record<string, MediaItem[]>>(() => ({
    LICENSE: this.items().filter(i => i.kind === 'LICENSE'),
    ID_CARD: this.items().filter(i => i.kind === 'ID_CARD')
  }));

  constructor() { effect(() => this.media.list('USER', this.userId()).subscribe(l => this.set(l))); }

  private set(l: MediaItem[]) { this.items.set(l); this.itemsChange.emit(l); }
  added(m: MediaItem) { this.set([m, ...this.items()]); }
  setReview(m: MediaItem, v: Review) {
    this.media.review(m.id, v).subscribe(u => this.set(this.items().map(x => x.id === u.id ? u : x)));
  }
  remove(m: MediaItem) {
    if (confirm('Supprimer ce document ?')) this.media.remove(m.id).subscribe(() => this.set(this.items().filter(x => x.id !== m.id)));
  }
}