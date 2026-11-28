import { Component, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingStore } from './booking-store';

@Component({
  selector: 'app-step-confirm', standalone: true, imports: [RouterLink],
  template: `
    <div class="done">
      <div class="check"><svg viewBox="0 0 52 52"><path d="M14 27l8 8 16-17"/></svg></div>
      <h1>Dossier <em>transmis !</em></h1>
      <p>L’agence vérifie votre permis puis confirme votre réservation. Vous suivez tout en direct.</p>

      @if (store.reservation(); as r) {
        <div class="recap">
          <div><small>Période</small><b>{{ r.dateDebut }} → {{ r.dateFin }}</b></div>
          <div><small>Voiture</small><b>{{ r.carName }}</b></div>
          <div><small>Total</small><b>{{ r.prixTotal }}€</b></div>
          @if (r.remise > 0) { <div><small>Économisé</small><b class="save">{{ r.remise }}€</b></div> }
        </div>
      }
      <div class="links">
        <a routerLink="/mes-reservations" class="btn">Suivre ma réservation</a>
        <a routerLink="/cars" class="soft">Voir d’autres voitures</a>
      </div>
    </div>`,
  styles: [`
    .done { max-width:560px; margin:30px auto; text-align:center; }
    .check { width:96px; height:96px; margin:0 auto 22px; border-radius:50%; background:linear-gradient(135deg,#10b981,#059669); animation:pop .6s var(--ease); box-shadow:0 18px 40px rgba(16,185,129,.4); }
    .check svg { width:100%; height:100%; } .check path { fill:none; stroke:#fff; stroke-width:4; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:50; stroke-dashoffset:50; animation:draw .6s var(--ease) .4s forwards; }
    @keyframes draw { to { stroke-dashoffset:0; } } @keyframes pop { 0% { transform:scale(.3); } 60% { transform:scale(1.12); } }
    h1 { font-size:clamp(1.9rem,4vw,2.6rem); animation:fadeUp .6s var(--ease) .2s backwards; } p { color:var(--muted); animation:fadeUp .6s var(--ease) .3s backwards; }
    .recap { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; margin:26px 0; text-align:left; }
    .recap div { padding:16px; background:var(--card); border:1px solid var(--line); border-radius:16px; animation:fadeUp .5s var(--ease) .4s backwards; }
    .recap small { display:block; color:var(--muted); font-size:.75rem; } .recap b { font-size:.95rem; } .save { color:#047857; }
    .links { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; animation:fadeUp .6s var(--ease) .5s backwards; }
    .links .btn, .links .soft { padding:14px 24px; border-radius:14px; }
  `]
})
export class StepConfirmComponent implements OnDestroy {
  readonly store = inject(BookingStore);
  ngOnDestroy() { this.store.reset(); }    // the journey is finished: clear the temporary state
}