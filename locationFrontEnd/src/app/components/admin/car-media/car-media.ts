import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { UploaderComponent } from '../../../shared/uploader';
import { MediaService } from '../../../services/media-service';
import { CarService } from '../../../services/car-service';
import { Car } from '../../../models/car';
import { MediaItem } from '../../../models/media';


@Component({
  selector: 'app-car-media', standalone: true, imports: [UploaderComponent],
  template: `
    <div class="drawer-overlay" (click)="closed.emit()">
      <aside class="drawer" (click)="$event.stopPropagation()">
        <header class="dhead">
          <div><b>📷 Photos · {{ car().marque }} {{ car().modele }}</b><br><small>La photo ⭐ est la couverture affichée aux clients.</small></div>
          <button class="x" (click)="closed.emit()" aria-label="Fermer">✕</button>
        </header>
        <div class="dbody">
          <app-uploader ownerType="CAR" [ownerId]="car().id!.toString()" kind="PHOTO" label="Ajouter des photos de la voiture" (uploaded)="added($event)" />
          <div class="grid">
            @for (m of photos(); track m.id; let i = $index) {
              <figure [style.--i]="i" [class.cover]="url(m) === cover()">
                <img [src]="url(m)" [alt]="m.name">
                @if (url(m) === cover()) { <span class="tag">⭐ Couverture</span> }
                <figcaption>
                  @if (url(m) !== cover()) { <button (click)="setCover(m)">⭐ Couverture</button> }
                  <button class="del" (click)="remove(m)">🗑️</button>
                </figcaption>
              </figure>
            } @empty { <p class="empty">Aucune photo pour cette voiture.</p> }
          </div>
        </div>
      </aside>
    </div>`,
  styles: [`
    .dhead small { color:var(--muted); }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:14px; }
    figure { position:relative; margin:0; border-radius:16px; overflow:hidden; aspect-ratio:4/3; background:#e5e7f0; animation:fadeUp .5s var(--ease) backwards; animation-delay:calc(var(--i) * 70ms); transition:transform .4s var(--ease), box-shadow .4s; }
    figure:hover { transform:translateY(-4px); box-shadow:var(--shadow); } figure.cover { outline:3px solid var(--primary); }
    img { width:100%; height:100%; object-fit:cover; }
    .tag { position:absolute; top:8px; left:8px; padding:4px 10px; border-radius:99px; background:var(--primary); color:#fff; font:600 .7rem 'Inter'; }
    figcaption { position:absolute; inset:auto 0 0 0; display:flex; gap:6px; justify-content:center; padding:10px; background:linear-gradient(to top,rgba(11,18,32,.75),transparent); opacity:0; transform:translateY(10px); transition:all .35s var(--ease); }
    figure:hover figcaption { opacity:1; transform:none; }
    figcaption button { border:0; border-radius:99px; padding:7px 12px; background:#fff; cursor:pointer; font:600 .75rem 'Inter'; }
  `]
})
export class CarMediaComponent implements OnInit {
  private media = inject(MediaService);
  private cars = inject(CarService);

  car = input.required<Car>();
  closed = output<void>();
  photos = signal<MediaItem[]>([]);
  cover = signal<string | undefined>(undefined);

  ngOnInit() {
    this.cover.set(this.car().imageUrL);
    this.media.list('CAR', String(this.car().id!)).subscribe(l => this.photos.set(l.filter(m => m.kind === 'PHOTO')));
  }

  url(m: MediaItem) { return this.media.url(m.id); }
  added(m: MediaItem) { this.photos.update(l => [m, ...l]); if (!this.cover()) this.saveCover(this.url(m)); }
  setCover(m: MediaItem) { this.saveCover(this.url(m)); }

  remove(m: MediaItem) {
    if (!confirm('Supprimer cette photo ?')) return;
    this.media.remove(m.id).subscribe(() => {
      const rest = this.photos().filter(x => x.id !== m.id);
      this.photos.set(rest);
      if (this.cover() === this.url(m)) this.saveCover(rest.length ? this.url(rest[0]) : '');
    });
  }

  private saveCover(url: string) {
    this.cars.update(String(this.car().id!), { ...this.car(), imageUrL: url }).subscribe(() => this.cover.set(url));
  }
}