import { Component, OnInit, computed, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingStore, iso } from '../booking-store';
import { CarService } from '../../../services/car-service';
import { OptionService } from '../../../services/option';
import { ReservationService } from '../../../services/reservation-service';
import { AuthService } from '../../../services/auth-service';
import { SpotlightDirective } from '../../../shared/spotlight';

@Component({
  selector: 'app-step-options', standalone: true, imports: [RouterLink, SpotlightDirective],
  templateUrl: './step-options.html', styleUrl: './step-options.css'
})
export class StepOptionsComponent implements OnInit {
  readonly store = inject(BookingStore);
  private cars = inject(CarService);
  private optService = inject(OptionService);
  private api = inject(ReservationService);
  private auth = inject(AuthService);

  completed = output<void>();

  options = this.optService.options;
  car = computed(() => {
    const carId = this.store.carId();
    return carId == null ? undefined : this.cars.cars().find(c => c.id === Number(carId));
  });
  today = iso(new Date());
  minFin = computed(() => {
    const d = this.store.debut() ? new Date(this.store.debut() + 'T00:00') : new Date();
    d.setDate(d.getDate() + 1);
    return iso(d);
  });

  promoInput = signal('');
  sending = signal(false);
  error = signal('');
  promoMessage = computed(() => {
    const msg: Record<string, string> = {
      INVALID: 'Code inconnu', INACTIVE: 'Ce code n’est plus actif',
      EXPIRED: 'Ce code a expiré', EXHAUSTED: 'Ce code a atteint sa limite'
    };
    return msg[this.store.quote()?.promoStatus ?? ''] ?? '';
  });
  canContinue = computed(() => !!this.car()?.disponible && !!this.store.quote() &&
    (!this.store.promo() || this.store.quote()?.promoStatus === 'OK'));

  ngOnInit() {
    this.optService.load();
    if (!this.cars.cars().length) this.cars.getAllCars();
  }

  toggle(id: number) { this.store.extras.update(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]); }
  setDebut(v: string) { this.store.debut.set(v); if (this.store.fin() <= v) this.store.fin.set(''); }
  applyPromo() { this.store.promo.set(this.promoInput().trim().toUpperCase()); }
  clearPromo() { this.store.promo.set(''); this.promoInput.set(''); }

  submit() {
    const user = this.auth.currentUser();
    if (!user || !this.canContinue()) return;
    this.sending.set(true); this.error.set('');
    this.api.createReservation({
      carId: this.store.carId(), userId: String(user.id),
      dateDebut: this.store.debut(), dateFin: this.store.fin(),
      optionIds: this.store.extras(), promoCode: this.store.promo() || null
    }).subscribe({
      next: res => { this.store.reservation.set(res.data); this.sending.set(false); this.completed.emit(); },
      error: e => { this.error.set(typeof e.error === 'string' ? e.error : 'Réservation impossible.'); this.sending.set(false); }
    });
  }

  /** Cancels the saved reservation so the client can change dates or options */
  edit() {
    const r = this.store.reservation();
    if (!r) return;
    this.api.cancel(r.id, String(this.auth.currentUser()!.id)).subscribe({
      next: () => this.store.reservation.set(null),
      error: e => this.error.set(typeof e.error === 'string' ? e.error : 'Modification impossible.')
    });
  }
}