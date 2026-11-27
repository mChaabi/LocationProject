import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { CarService } from '../../services/car-service';
import { ReservationService } from '../../services/reservation-service';
import { AuthService } from '../../services/auth-service';
import { OptionService } from '../../services/option';
import { MediaService } from '../../services/media-service';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css',
})
export class CarDetailComponent implements OnInit {
  private carService = inject(CarService);
  private optService = inject(OptionService);
  private reservations = inject(ReservationService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private id = this.route.snapshot.paramMap.get('id')!;
  private query = this.route.snapshot.queryParamMap;

  user = this.auth.currentUser;
  options = this.optService.options;
  extras = signal<number[]>([]);
  sending = signal(false);
  done = signal<any>(null);
  error = signal('');
  private media = inject(MediaService);
  photos = signal<string[]>([]);
  active = signal(0);

  car = computed(() => this.carService.cars().find((c) => String(c.id) === this.id));
  form = this.fb.nonNullable.group({
    dateDebut: [this.query.get('debut') ?? '', Validators.required],
    dateFin: [this.query.get('fin') ?? '', Validators.required],
  });
  private dates = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  promoInput = signal('');
  promo = signal(''); // code sent to the backend
  promoMessage = computed(() => {
    const msg: Record<string, string> = {
      INVALID: 'Code inconnu',
      INACTIVE: 'Ce code n’est plus actif',
      EXPIRED: 'Ce code a expiré',
      EXHAUSTED: 'Ce code a atteint sa limite d’utilisation',
    };
    return msg[this.quote()?.promoStatus ?? ''] ?? '';
  });

  quote = toSignal(
    toObservable(
      computed(() => ({
        ...this.dates(),
        ids: this.extras(),
        promo: this.promo(),
        uid: this.user()?.id,
      })),
    ).pipe(
      debounceTime(250),
      switchMap((p) =>
        p.dateDebut && p.dateFin && p.dateFin > p.dateDebut
          ? this.reservations
              .quote(
                this.id,
                p.dateDebut,
                p.dateFin,
                p.ids,
                p.uid != null ? String(p.uid) : undefined,
                p.promo || undefined,
              )
              .pipe(catchError(() => of(null)))
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  applyPromo() {
    this.promo.set(this.promoInput().trim().toUpperCase());
  }
  clearPromo() {
    this.promo.set('');
    this.promoInput.set('');
  }

  ngOnInit() {
    if (!this.carService.cars().length) this.carService.getAllCars();
    this.optService.load();
    this.media
      .list('CAR', this.id)
      .subscribe((l) =>
        this.photos.set(l.filter((m) => m.kind === 'PHOTO').map((m) => this.media.url(m.id))),
      );
  }

  toggle(id: number) {
    this.extras.update((l) => (l.includes(id) ? l.filter((k) => k !== id) : [...l, id]));
  }

  submit() {
    const user = this.user();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.sending.set(true);
    this.error.set('');
    this.reservations
      .createReservation({
        carId: this.id,
        userId: String(user.id),
        optionIds: this.extras(),
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: (res) => {
          this.done.set(res.data);
          this.sending.set(false);
        },
        error: (e) => {
          this.error.set(typeof e.error === 'string' ? e.error : 'Erreur, réessayez.');
          this.sending.set(false);
        },
      });
  }
}
