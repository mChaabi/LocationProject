import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarService } from '../../services/car-service';
import { ReservationService } from '../../services/reservation-service';
import { AuthService } from '../../services/auth-service';
import { OptionService } from '../../services/option';

interface CarItem {
  id: string | number;
  marque?: string;
  modele?: string;
  typeBoite?: string;
  couleur?: string;
  annee?: number | string;
  prixJournalier?: number;
  disponible?: boolean;
  imageUrL?: string;
}

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.css',
})
export class CarDetailComponent implements OnInit {
  private carService = inject(CarService);
  private reservations = inject(ReservationService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  private route = inject(ActivatedRoute);
  private id = this.route.snapshot.paramMap.get('id');

  private optService = inject(OptionService);
  options = this.optService.options;
  extras = signal<number[]>([]);

  form = this.fb.nonNullable.group({
    dateDebut: [this.route.snapshot.queryParamMap.get('debut') ?? '', Validators.required],
    dateFin: [this.route.snapshot.queryParamMap.get('fin') ?? '', Validators.required],
  });

  perDay = computed(
    () =>
      (this.car()?.prixJournalier ?? 0) +
      this.options()
        .filter((o) => this.extras().includes(o.id))
        .reduce((s, o) => s + o.price, 0),
  );

  sending = signal(false);
  done = signal(false);
  error = signal('');

  car = computed(() => {
    if (this.id === null) {
      return undefined;
    }
    const carsList = (this.carService.cars() as CarItem[]) ?? [];
    return carsList.find((c: CarItem) => String(c.id) === this.id);
  });

  private dates = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  days = computed(() => {
    const { dateDebut, dateFin } = this.dates();
    if (!dateDebut || !dateFin) {
      return 0;
    }
    return Math.max(0, Math.round((+new Date(dateFin) - +new Date(dateDebut)) / 864e5));
  });

  total = computed(() => this.days() * this.perDay());

  ngOnInit() {
    if (!this.carService.cars().length) this.carService.getAllCars();
    this.optService.load();
  }
  toggle(id: number) {
    this.extras.update((l) => (l.includes(id) ? l.filter((k) => k !== id) : [...l, id]));
  }

  submit(): void {
    this.sending.set(true);
    this.error.set('');

    const currentUserId = this.auth.currentUser()?.id ?? 'guest';

    this.reservations
      .createReservation({
        carId: this.id,
        userId: String(currentUserId),
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.done.set(true);
          this.sending.set(false);
        },
        error: (err) => {
          this.error.set(typeof err?.error === 'string' ? err.error : 'Erreur, réessayez.');
          this.sending.set(false);
        },
      });
  }
}
