import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Car } from '../../models/car';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    @let c = car();
    <a class="card" [routerLink]="['/cars', c.id]" [queryParams]="dates()" [class.off]="!c.disponible">
      <div class="media">
        <div class="ph">{{ c.marque.charAt(0) }}</div>
        @if (c.imageUrL) {
          <img [src]="c.imageUrL" [alt]="c.modele" loading="lazy" (error)="$any($event.target).remove()">
        }
        <span class="badge" [class.ok]="c.disponible">{{ c.disponible ? 'Disponible' : 'Indisponible' }}</span>
        <div class="hover"><span class="cta">{{ c.disponible ? 'Choisir cette voiture →' : 'Voir les détails →' }}</span></div>
      </div>
      <div class="body">
        <small>{{ c.marque }}</small>
        <h3>{{ c.modele }}</h3>
        <div class="chips"><span>⚙️ {{ c.typeBoite }}</span><span>🎨 {{ c.couleur }}</span><span>📅 {{ c.annee }}</span></div>
        <div class="foot"><strong>{{ c.prixJournalier }}€ <i>/jour</i></strong><span class="go">Détails →</span></div>
      </div>
    </a>`,
  styles: [`
    :host { display:block; }
    .card { display:block; background:var(--card); border-radius:var(--radius); overflow:hidden; border:1px solid var(--line);
      box-shadow:var(--shadow); transition:transform .5s var(--ease), box-shadow .5s var(--ease), border-color .3s; }
    .card:hover { transform:translateY(-10px); box-shadow:0 28px 60px rgba(79,70,229,.2); border-color:#c7d2fe; }
    .card.off { filter:grayscale(.6); opacity:.85; }
    .media { position:relative; height:210px; overflow:hidden; }
    .ph { position:absolute; inset:0; display:grid; place-items:center; font:800 4rem 'Inter'; color:rgba(255,255,255,.9);
      background:linear-gradient(135deg,var(--primary),var(--primary-2)); }
    img { position:relative; width:100%; height:100%; object-fit:cover; transition:transform .9s var(--ease); }
    .card:hover img { transform:scale(1.1); }
    .badge { position:absolute; z-index:2; top:14px; left:14px; padding:6px 12px; border-radius:99px; font:600 .75rem 'Inter';
      background:rgba(239,68,68,.92); color:#fff; }
    .badge.ok { background:rgba(16,185,129,.92); }
    .hover { position:absolute; z-index:1; inset:0; display:flex; align-items:flex-end; justify-content:center; padding:18px;
      background:linear-gradient(to top, rgba(11,18,32,.78), transparent 65%); opacity:0; transition:opacity .4s var(--ease); }
    .cta { background:#fff; color:var(--ink); padding:11px 22px; border-radius:99px; font:700 .85rem 'Inter';
      transform:translateY(18px); transition:transform .5s var(--ease); }
    .card:hover .hover { opacity:1; } .card:hover .cta { transform:none; }
    .body { padding:20px 22px 22px; }
    small { color:var(--muted); text-transform:uppercase; letter-spacing:.08em; font-weight:600; font-size:.72rem; }
    h3 { font-size:1.35rem; margin:4px 0 14px; }
    .chips { display:flex; gap:8px; flex-wrap:wrap; }
    .chips span { background:var(--bg); padding:6px 11px; border-radius:99px; font-size:.8rem; color:#475569; }
    .foot { display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:16px; border-top:1px solid var(--line); }
    .foot strong { font-size:1.4rem; } .foot i { font-size:.8rem; color:var(--muted); font-style:normal; font-weight:500; }
    .go { color:var(--primary); font-weight:600; font-size:.9rem; transition:transform .3s var(--ease); }
    .card:hover .go { transform:translateX(6px); }
  `]
})
export class CarCardComponent {
  car = input.required<Car>();
  dates = input<{ debut: string; fin: string } | null>(null);
}