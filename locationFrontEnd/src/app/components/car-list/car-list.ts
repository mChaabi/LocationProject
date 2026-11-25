import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car-service';
import { Car } from '../../models/car';
import { Router, RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/reveal';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarListComponent implements OnInit {
  // Injection du service
  private carService = inject(CarService);

  constructor(private router: Router) {}

  // Utilisation du signal du service
  cars = this.carService.cars;
  loaded = this.carService.loaded;
  search = signal('');
  gearbox = signal('all');
  filtered = computed(() =>
    this.cars().filter(
      (c) =>
        (this.gearbox() === 'all' || c.typeBoite === this.gearbox()) &&
        `${c.marque} ${c.modele}`.toLowerCase().includes(this.search().toLowerCase()),
    ),
  );

  ngOnInit(): void {
    // On déclenche le chargement des données au démarrage
    this.carService.getAllCars();
  }

  reserverVoiture(car: Car) {
    this.router.navigate(['/reservations'], { queryParams: { carId: car.id } });
  }
}
