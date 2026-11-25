import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CarService } from '../../services/car-service';
import { RevealDirective } from '../../shared/reveal';
import { CounterDirective } from '../../shared/counter';
import { CarCardComponent } from '../../shared/car-card/car-card';

@Component({
  selector: 'app-home', standalone: true,
  imports: [RouterLink, CarCardComponent, RevealDirective, CounterDirective],
  templateUrl: './home.html', styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private carService = inject(CarService);

  today = new Date().toISOString().slice(0, 10);
  debut = signal('');
  fin = signal('');
  valid = computed(() => !!this.debut() && !!this.fin() && this.fin() > this.debut());
  loaded = this.carService.loaded;
  featured = computed(() => this.carService.cars().filter(c => c.disponible).slice(0, 3));

  stats = computed(() => {
    const cars = this.carService.cars();
    return [
      { value: cars.length, suffix: '', label: 'Véhicules en flotte' },
      { value: cars.filter(c => c.disponible).length, suffix: '', label: 'Disponibles aujourd’hui' },
      { value: 24, suffix: '/7', label: 'Assistance clients' },
    ];
  });

  steps = [
    { icon: '📅', title: 'Choisissez vos dates', text: 'Seules les voitures réellement libres s’affichent.' },
    { icon: '🚗', title: 'Sélectionnez votre voiture', text: 'Photos, prix et caractéristiques en un coup d’œil.' },
    { icon: '➕', title: 'Ajoutez vos options', text: 'GPS, siège bébé, 2ᵉ conducteur… le prix se met à jour en direct.' },
    { icon: '✅', title: 'Confirmez', text: 'L’agence valide et vous suivez votre réservation en ligne.' },
  ];

  perks = [
    { icon: '🔒', title: 'Zéro double réservation', text: 'Disponibilité vérifiée automatiquement pour vos dates.' },
    { icon: '💶', title: 'Prix transparent', text: 'Le total est calculé avant de réserver, options comprises.' },
    { icon: '📲', title: 'Suivi en ligne', text: 'Statut de votre réservation sans appeler l’agence.' },
    { icon: '🛟', title: 'Assistance 24/7', text: 'Une équipe disponible à tout moment du trajet.' },
  ];

  ngOnInit() { this.carService.getAllCars(); }

  search() {
    this.router.navigate(['/cars'], { queryParams: { debut: this.debut(), fin: this.fin() } });
  }
  scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }
}