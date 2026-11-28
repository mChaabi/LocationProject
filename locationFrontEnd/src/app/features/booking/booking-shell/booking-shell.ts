import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { BookingStore, StepKey } from '../booking-store';
import { CarService } from '../../../services/car-service';
import { AuthService } from '../../../services/auth-service';
import { StepAccountComponent } from '../step-account';
import { StepOptionsComponent } from '../step-options/step-options';
import { StepDocumentsComponent } from '../step-documents';
import { StepConfirmComponent } from '../step-confirm';

@Component({
  selector: 'app-booking-shell', standalone: true,
  imports: [StepAccountComponent, StepOptionsComponent, StepDocumentsComponent, StepConfirmComponent],
  templateUrl: './booking-shell.html', styleUrl: './booking-shell.css'
})
export class BookingShellComponent implements OnInit {
  readonly store = inject(BookingStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cars = inject(CarService);
  private auth = inject(AuthService);

  private asked = toSignal(this.route.queryParamMap.pipe(map(q => q.get('etape') as StepKey | null)), { initialValue: null });

  car = computed(() => this.cars.cars().find(c => String(c.id) === this.store.carId()));
  /** The displayed step is always a valid one (never a locked step) */
  current = computed<StepKey>(() => { const a = this.asked(); return a && this.store.unlocked(a) ? a : this.store.firstOpen(); });
  progress = computed(() => this.store.steps.findIndex(s => s.key === this.current()) / (this.store.steps.length - 1));
  total = computed(() => this.store.reservation()?.prixTotal ?? this.store.quote()?.total ?? null);

  constructor() {
    effect(() => {
      const u = this.auth.currentUser();
      if (u) this.store.loadDocs(String(u.id)); else this.store.docs.set([]);
    });
  }

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    this.store.start(this.route.snapshot.paramMap.get('carId')!, { debut: q.get('debut'), fin: q.get('fin') });
    if (!this.cars.cars().length) this.cars.getAllCars();
  }

  state(key: StepKey): 'soon' | 'active' | 'done' | 'todo' | 'locked' {
    if (this.store.steps.find(s => s.key === key)?.soon) return 'soon';
    if (key === this.current()) return 'active';
    if (this.store.done()[key]) return 'done';
    return this.store.unlocked(key) ? 'todo' : 'locked';
  }
  go(key: StepKey) {
    if (!this.store.unlocked(key)) return;
    this.router.navigate([], { relativeTo: this.route, queryParams: { etape: key }, queryParamsHandling: 'merge' });
  }
  advance() { this.go(this.store.nextOf(this.current())); }
}