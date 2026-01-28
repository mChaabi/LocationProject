import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarService } from '../../services/car-service';
import { Car } from '../../models/car';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css'
})
export class CarListComponent implements OnInit {
  // Injection du service
  private carService = inject(CarService);

  constructor(private router: Router) {}

  // Utilisation du signal du service
  cars = this.carService.cars;

  ngOnInit(): void {
    // On déclenche le chargement des données au démarrage
    this.carService.getAllCars();
  }

  reserverVoiture(car: Car) {
    console.log('Réservation pour :', car.marque, car.modele);
    this.router.navigate(['/reservation']);
    // Ici, tu pourras rediriger vers la page de réservation avec l'ID
  }
}
