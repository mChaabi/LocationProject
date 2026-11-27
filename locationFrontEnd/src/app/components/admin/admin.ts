import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarService } from '../../services/car-service';
import { ReservationService } from '../../services/reservation-service';
import { Car } from '../../models/car';
import { OptionService } from '../../services/option';
import { ExtraOption } from '../../models/ExtraOption';
import { PricingService } from '../../services/pricing';
import { Promo, Rule } from '../../models/pricing';
import { AdminClientsComponent } from './admin-clients/admin-clients';
import { CarMediaComponent } from './car-media/car-media';
import { ReservationFileComponent } from './reservation-file/reservation-file';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, AdminClientsComponent, CarMediaComponent, ReservationFileComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  private carService = inject(CarService);
  private resService = inject(ReservationService);

  cars = this.carService.cars;
  reservations = signal<any[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  private fb = inject(FormBuilder);
  private pricing = inject(PricingService);
  promos = this.pricing.promos;
  rules = computed(() => {
    const r = this.pricing.rules();
    return r ? [...r.loyalty, ...r.duration] : [];
  });
  maxRate = computed(() => this.pricing.rules()?.maxRate ?? 30);
  promoError = signal('');

  tab = signal<'dashboard' | 'cars' | 'reservations' | 'clients' | 'options' | 'promos'>(
    'dashboard',
  );
  file = signal<any>(null);
  mediaCar = signal<Car | null>(null);

  private optService = inject(OptionService);
  options = this.optService.options;
  optForm = inject(FormBuilder).nonNullable.group({
    icon: '✨',
    name: ['', Validators.required],
    price: [5, Validators.min(0.5)],
  });

  // in ngOnInit: this.optService.load();
  addOption() {
    this.optService
      .create(this.optForm.getRawValue())
      .subscribe(() => this.optForm.patchValue({ name: '' }));
  }
  removeOption(o: ExtraOption) {
    this.optService.remove(o.id).subscribe();
  }

  form = inject(FormBuilder).nonNullable.group({
    marque: ['', Validators.required],
    modele: ['', Validators.required],
    typeBoite: 'automatique',
    couleur: '',
    annee: [2024, Validators.min(1900)],
    prixJournalier: [50, Validators.min(1)],
    imageUrL: '',
    disponible: true,
  });

  promoForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]{3,20}$/)]],
    percent: [10, [Validators.min(1), Validators.max(50)]],
    expiresAt: '',
    maxUses: 0,
  });
  ruleForm = this.fb.nonNullable.group({
    kind: ['LOYALTY' as Rule['kind']],
    name: ['', Validators.required],
    threshold: [1, Validators.min(1)],
    rate: [5, [Validators.min(1), Validators.max(50)]],
  });

  stats = computed(() => {
    const r = this.reservations();
    return [
      { label: 'Voitures', value: this.cars().length, icon: '🚗' },
      { label: 'Disponibles', value: this.cars().filter((c) => c.disponible).length, icon: '✅' },
      { label: 'En attente', value: r.filter((x) => x.statut === 'en_attente').length, icon: '⏳' },
      {
        label: 'Revenus (€)',
        value: r.filter((x) => x.statut === 'confirmee').reduce((s, x) => s + x.prixTotal, 0),
        icon: '💶',
      },
    ];
  });

  ngOnInit() {
    this.carService.getAllCars();
    this.loadReservations();
  }
  loadReservations() {
    this.resService.getAll().subscribe((r) => this.reservations.set(r));
  }

  addPromo() {
    const f = this.promoForm.getRawValue();
    this.promoError.set('');
    this.pricing
      .savePromo({
        code: f.code.toUpperCase(),
        percent: f.percent,
        active: true,
        uses: 0,
        expiresAt: f.expiresAt || null,
        maxUses: f.maxUses > 0 ? f.maxUses : null,
      })
      .subscribe({
        next: () => this.promoForm.patchValue({ code: '' }),
        error: () => this.promoError.set('Création impossible (ce code existe peut-être déjà).'),
      });
  }
  togglePromo(p: Promo) {
    this.pricing.savePromo({ ...p, active: !p.active }).subscribe();
  }
  removePromo(p: Promo) {
    if (confirm(`Supprimer le code ${p.code} ?`)) this.pricing.removePromo(p.id!).subscribe();
  }

  addRule() {
    this.pricing
      .saveRule(this.ruleForm.getRawValue())
      .subscribe(() => this.ruleForm.patchValue({ name: '' }));
  }
  updateRule(r: Rule, patch: Partial<Rule>) {
    this.pricing.saveRule({ ...r, ...patch }).subscribe();
  }
  removeRule(r: Rule) {
    if (confirm(`Supprimer la règle ${r.name} ?`)) this.pricing.removeRule(r.id!).subscribe();
  }

  openForm(car?: Car) {
    this.editingId.set(car?.id != null ? String(car.id) : null);
    this.form.reset(
      car ?? {
        marque: '',
        modele: '',
        typeBoite: 'automatique',
        couleur: '',
        annee: 2024,
        prixJournalier: 50,
        imageUrL: '',
        disponible: true,
      },
    );
    this.showForm.set(true);
  }
  save() {
    const id = this.editingId(),
      body = this.form.getRawValue();
    (id ? this.carService.update(id, body) : this.carService.create(body)).subscribe(() =>
      this.showForm.set(false),
    );
  }
  toggle(c: Car) {
    this.carService.update(String(c.id), { ...c, disponible: !c.disponible }).subscribe();
  }
  remove(c: Car) {
    if (confirm(`Supprimer ${c.marque} ${c.modele} ?`))
      this.carService.remove(String(c.id!)).subscribe();
  }
  setStatus(r: any, value: string) {
    this.resService.setStatus(r.id, value).subscribe(() => this.loadReservations());
  }
}
