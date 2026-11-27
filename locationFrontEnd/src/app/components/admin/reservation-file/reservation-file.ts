import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { ClientDocsComponent } from '../../../shared/client-docs';
import { UserService } from '../../../services/user-service';
import { ReservationService } from '../../../services/reservation-service';
import { User } from '../../../models/user';
import { MediaItem } from '../../../models/media';


@Component({
  selector: 'app-reservation-file', standalone: true, imports: [ClientDocsComponent],
  template: `
    @let r = reservation();
    <div class="drawer-overlay" (click)="closed.emit()">
      <aside class="drawer" (click)="$event.stopPropagation()">
        <header class="dhead">
          <div><b>{{ r.carName }}</b><br><small>{{ r.dateDebut }} → {{ r.dateFin }} · {{ price().days }} jour(s)</small></div>
          <span [class]="'st ' + status()">{{ status().replace('_', ' ') }}</span>
          <button class="x" (click)="closed.emit()" aria-label="Fermer">✕</button>
        </header>

        <nav class="tabs">
          @for (t of tabs; track t.key) {
            <button [class.on]="tab() === t.key" [disabled]="!t.ready" (click)="tab.set(t.key)">
              {{ t.label }} @if (!t.ready) { <i>bientôt</i> }
            </button>
          }
        </nav>

        <div class="dbody">
          @switch (tab()) {
            @case ('client') {
              @if (client(); as c) {
                <div class="panel who">
                  <span class="avatar">{{ (c.prenom[0] + c.nom[0]).toUpperCase() }}</span>
                  <div><b>{{ c.prenom }} {{ c.nom }}</b><br><small>{{ c.email }}</small><br><small>📞 {{ c.telephone }}</small></div>
                </div>
              }
              <div class="banner" [class.ok]="licenseOk()">
                {{ licenseOk() ? '✅ Permis vérifié : prêt pour la remise des clés' : '⚠️ Permis non vérifié : contrôlez-le avant la remise des clés' }}
              </div>
              <app-client-docs [userId]="r.userId" mode="admin" (itemsChange)="docs.set($event)" />
            }
            @case ('price') {
              <div class="panel price">
                <div class="line"><span>Sous-total ({{ price().days }} j)</span><b>{{ price().subtotal }}€</b></div>
                @if (price().discount > 0) { <div class="line disc"><span>Remises @if (r.promoCode) { · 🏷️ {{ r.promoCode }} }</span><b>−{{ price().discount }}€</b></div> }
                @if (r.extras) { <div class="line"><span>Options</span><b class="opt">{{ r.extras }}</b></div> }
                <div class="line total"><span>Total à payer</span><b>{{ price().total }}€</b></div>
              </div>
            }
          }
        </div>

        <footer class="actions">
          @if (status() === 'en_attente') { <button class="btn" (click)="confirmIt()">✅ Confirmer la réservation</button> }
          @if (status() !== 'annulee') { <button class="cancel" (click)="setStatus('annulee')">Annuler</button> }
        </footer>
      </aside>
    </div>`,
  styles: [`
    .dhead small { color:var(--muted); }
    .tabs { display:flex; gap:6px; padding:12px 24px 0; overflow-x:auto; }
    .tabs button { padding:10px 16px; border:0; border-radius:12px 12px 0 0; background:transparent; cursor:pointer; font:600 .85rem 'Inter'; color:var(--muted); white-space:nowrap; transition:all .3s var(--ease); }
    .tabs button.on { background:#fff; color:var(--ink); box-shadow:0 -2px 0 var(--primary) inset; }
    .tabs button:disabled { cursor:not-allowed; opacity:.55; } .tabs i { margin-left:6px; padding:2px 8px; border-radius:99px; background:#e5e7eb; font-size:.65rem; font-style:normal; }
    .who { display:flex; gap:16px; align-items:center; } .who small { color:var(--muted); }
    .banner { padding:14px 18px; border-radius:14px; background:#fef3c7; color:#92400e; font-weight:600; font-size:.9rem; animation:fadeUp .5s var(--ease) backwards; }
    .banner.ok { background:#d1fae5; color:#047857; }
    .line { display:flex; justify-content:space-between; gap:16px; padding:12px 0; border-bottom:1px dashed var(--line); }
    .line.disc b { color:#047857; } .opt { font-size:.85rem; text-align:right; }
    .line.total { border:0; padding-top:18px; font-size:1.1rem; } .line.total b { font-size:1.9rem; letter-spacing:-.02em; }
    .actions { position:sticky; bottom:0; display:flex; gap:12px; padding:16px 24px; background:rgba(246,247,251,.92); backdrop-filter:blur(10px); border-top:1px solid var(--line); }
    .cancel { padding:14px 22px; border-radius:14px; cursor:pointer; background:#fff; border:2px solid #fecaca; color:#b91c1c; font:600 .9rem 'Inter'; transition:all .25s var(--ease); }
    .cancel:hover { background:#fee2e2; transform:translateY(-2px); }
  `]
})
export class ReservationFileComponent implements OnInit {
  private users = inject(UserService);
  private api = inject(ReservationService);

  reservation = input.required<any>();
  closed = output<void>();
  changed = output<void>();

  client = signal<User | null>(null);
  docs = signal<MediaItem[]>([]);
  status = signal('');
  tab = signal<'client' | 'price'>('client');
  tabs = [
    { key: 'client' as const, label: '👤 Client & documents', ready: true },
    { key: 'price' as const, label: '💶 Prix', ready: true },
    { key: 'contract' as any, label: '📝 Contrat', ready: false },
    { key: 'inspection' as any, label: '📸 État des lieux', ready: false },
    { key: 'payment' as any, label: '💳 Paiement', ready: false }
  ];

  licenseOk = computed(() => this.docs().some(d => d.kind === 'LICENSE' && d.review === 'VERIFIED'));
  price = computed(() => {
    const r = this.reservation(), discount = r.remise ?? 0;
    const days = Math.max(1, Math.round((+new Date(r.dateFin) - +new Date(r.dateDebut)) / 864e5));
    return { days, discount, total: r.prixTotal, subtotal: Math.round((r.prixTotal + discount) * 100) / 100 };
  });

  ngOnInit() {
    this.status.set(this.reservation().statut);
    this.users.byId(this.reservation().userId).subscribe(u => this.client.set(u));
  }

  confirmIt() {
    if (!this.licenseOk() && !confirm('Le permis n’est pas vérifié. Confirmer quand même ?')) return;
    this.setStatus('confirmee');
  }
  setStatus(v: string) {
    this.api.setStatus(this.reservation().id, v).subscribe(() => { this.status.set(v); this.changed.emit(); });
  }
}