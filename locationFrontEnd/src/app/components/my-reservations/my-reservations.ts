import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation-service';
import { AuthService } from '../../services/auth-service';
import { Loyalty } from '../../models/pricing';

type Filter = 'all' | 'en_attente' | 'confirmee' | 'annulee';

@Component({
  selector: 'app-my-reservations', standalone: true, imports: [RouterLink],
  templateUrl: './my-reservations.html', styleUrl: './my-reservations.css'
})
export class MyReservationsComponent implements OnInit {
  private api = inject(ReservationService);
  private user = inject(AuthService).currentUser;
  private today = new Date().toISOString().slice(0, 10);

  list = signal<any[] | null>(null);          // null = loading
  loyalty = signal<Loyalty | null>(null);
  filter = signal<Filter>('all');
  confirming = signal<number | null>(null);
  error = signal('');

  steps = ['Demande envoyée', 'Confirmée par l’agence', 'Terminée'];
  tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Toutes' }, { key: 'en_attente', label: 'En attente' },
    { key: 'confirmee', label: 'Confirmées' }, { key: 'annulee', label: 'Annulées' }
  ];

  counts = computed<Record<Filter, number>>(() => {
    const l = this.list() ?? [];
    const n = (s: string) => l.filter(r => r.statut === s).length;
    return { all: l.length, en_attente: n('en_attente'), confirmee: n('confirmee'), annulee: n('annulee') };
  });
  visible = computed(() => (this.list() ?? []).filter(r => this.filter() === 'all' || r.statut === this.filter()));

  ngOnInit() {
    const uid = String(this.user()!.id);
    this.api.getUserReservations(uid).subscribe({
      next: l => this.list.set([...l].sort((a, b) => b.id - a.id)),
      error: () => this.list.set([])
    });
    this.api.loyalty(uid).subscribe(l => this.loyalty.set(l));
  }

  /** 1 = sent, 2 = confirmed, 3 = finished, -1 = cancelled */
  step(r: any): number {
    if (r.statut === 'annulee') return -1;
    if (r.statut === 'en_attente') return 1;
    return r.dateFin < this.today ? 3 : 2;
  }
  progress(r: any): number { return (Math.max(this.step(r), 1) - 1) / 2; }
  canCancel(r: any): boolean { return r.statut !== 'annulee' && r.dateDebut > this.today; }

  cancel(r: any) {
    this.error.set('');
    this.api.cancel(r.id, String(this.user()!.id)).subscribe({
      next: updated => { this.list.update(l => l!.map(x => x.id === updated.id ? updated : x)); this.confirming.set(null); },
      error: e => this.error.set(typeof e.error === 'string' ? e.error : 'Annulation impossible.')
    });
  }
}