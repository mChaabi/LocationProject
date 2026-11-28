import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { MediaService } from '../../services/media-service';
import { ReservationService } from '../../services/reservation-service';
import { MediaItem } from '../../models/media';

export type StepKey = 'account' | 'options' | 'documents' | 'contract' | 'confirm';
export interface StepDef { key: StepKey; label: string; hint: string; icon: string; soon?: boolean; }

/** One place to add, reorder or enable steps. The contract is enabled in the next step. */
export const STEPS: StepDef[] = [
  { key: 'account',   label: 'Compte',            hint: 'Inscription ou connexion', icon: '👤' },
  { key: 'options',   label: 'Voiture & options', hint: 'Dates, options, prix',     icon: '🚗' },
  { key: 'documents', label: 'Documents',         hint: 'Permis et identité',       icon: '🪪' },
  { key: 'contract',  label: 'Contrat',           hint: 'Lecture et signature',     icon: '✍️', soon: true },
  { key: 'confirm',   label: 'Confirmation',      hint: 'Dossier transmis',         icon: '🎉' }
];

/** yyyy-MM-dd in the local time zone */
export const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

@Injectable({ providedIn: 'root' })
export class BookingStore {
  private auth = inject(AuthService);
  private api = inject(ReservationService);
  private media = inject(MediaService);

  readonly steps = STEPS;
  private readonly flow = STEPS.filter(s => !s.soon).map(s => s.key);

  carId = signal('');
  debut = signal('');
  fin = signal('');
  extras = signal<number[]>([]);
  promo = signal('');
  reservation = signal<any>(null);
  docs = signal<MediaItem[]>([]);

  /** Price computed by the backend whenever dates, options, promo or user change */
  quote = toSignal(
    toObservable(computed(() => ({
      id: this.carId(), d: this.debut(), f: this.fin(), ids: this.extras(),
      promo: this.promo(), uid: this.auth.currentUser()?.id
    }))).pipe(
      debounceTime(250),
      switchMap(p => p.id && p.d && p.f && p.f > p.d
        ? this.api.quote(p.id, p.d, p.f, p.ids, p.uid != null ? String(p.uid) : undefined, p.promo || undefined)
            .pipe(catchError(() => of(null)))
        : of(null))
    ),
    { initialValue: null }
  );

  done = computed<Record<StepKey, boolean>>(() => ({
    account: !!this.auth.currentUser(),
    options: !!this.reservation(),
    documents: ['LICENSE', 'ID_CARD'].every(k => this.docs().some(d => d.kind === k)),
    contract: false,
    confirm: false
  }));

  constructor() {
    // Persist the journey so a page refresh does not lose it
    effect(() => {
      const id = this.carId();
      if (!id || typeof sessionStorage === 'undefined') return;
      sessionStorage.setItem('booking:' + id, JSON.stringify({
        debut: this.debut(), fin: this.fin(), extras: this.extras(), promo: this.promo(), reservation: this.reservation()
      }));
    });
  }

  start(carId: string, preset: { debut: string | null; fin: string | null }) {
    if (this.carId() === carId) return;
    let saved: any = {};
    try { saved = JSON.parse(sessionStorage.getItem('booking:' + carId) ?? '{}'); } catch { /* no storage */ }
    const keep = !!saved.reservation;
    this.carId.set(carId);
    this.debut.set(keep ? saved.debut : (preset.debut ?? saved.debut ?? ''));
    this.fin.set(keep ? saved.fin : (preset.fin ?? saved.fin ?? ''));
    this.extras.set(saved.extras ?? []);
    this.promo.set(saved.promo ?? '');
    this.reservation.set(saved.reservation ?? null);
  }

  reset() {
    const id = this.carId();
    if (id && typeof sessionStorage !== 'undefined') sessionStorage.removeItem('booking:' + id);
    this.carId.set(''); this.debut.set(''); this.fin.set(''); this.extras.set([]);
    this.promo.set(''); this.reservation.set(null);
  }

  loadDocs(userId: string) {
    this.media.list('USER', userId).subscribe({ next: l => this.docs.set(l), error: () => this.docs.set([]) });
  }

  /** A step is open when every step before it is done */
  unlocked(key: StepKey) {
    const i = this.flow.indexOf(key), d = this.done();
    return i >= 0 && this.flow.slice(0, i).every(k => d[k]);
  }
  firstOpen(): StepKey { const d = this.done(); return this.flow.find(k => k !== 'confirm' && !d[k]) ?? 'confirm'; }
  nextOf(key: StepKey): StepKey { return this.flow[Math.min(this.flow.indexOf(key) + 1, this.flow.length - 1)]; }
}