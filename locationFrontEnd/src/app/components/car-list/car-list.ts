import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarService } from '../../services/car-service';
import { RevealDirective } from '../../shared/reveal';
import { CarCardComponent } from '../../shared/car-card/car-card';

@Component({
  selector: 'app-car-list', standalone: true,
  imports: [RouterLink, CarCardComponent, RevealDirective],
  templateUrl: './car-list.html', styleUrl: './car-list.css'
})
export class CarListComponent implements OnInit {
  private carService = inject(CarService);
  private route = inject(ActivatedRoute);

  cars = this.carService.cars;
  search = signal('');
  gearbox = signal('all');
  range = signal<{ debut: string; fin: string } | null>(null);
  private freeIds = signal<Set<number> | null>(null);

  ready = computed(() => this.carService.loaded() && (!this.range() || this.freeIds() !== null));
  filtered = computed(() => {
    const free = this.freeIds(), q = this.search().toLowerCase(), g = this.gearbox();
    return this.cars().filter(c =>
      (!free || free.has(c.id!)) &&
      (g === 'all' || c.typeBoite === g) &&
      `${c.marque} ${c.modele}`.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.carService.getAllCars();
    const q = this.route.snapshot.queryParamMap;
    const debut = q.get('debut'), fin = q.get('fin');
    if (debut && fin) {
      this.range.set({ debut, fin });
      this.carService.getAvailable(debut, fin).subscribe({
        next: l => this.freeIds.set(new Set(l.map(c => c.id!))),
        error: () => this.freeIds.set(new Set())
      });
    }
  }
}