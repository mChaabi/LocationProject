import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal';
import { CounterDirective } from '../../shared/counter';

@Component({
  selector: 'app-about', standalone: true, imports: [RevealDirective, CounterDirective],
  templateUrl: './about.html', styleUrl: './about.css'
})
export class AboutComponent {
  // Replace with your agency's real numbers
  stats = [
    { value: 150, suffix: '+', label: 'Véhicules' },
    { value: 5000, suffix: '+', label: 'Clients satisfaits' },
    { value: 12, suffix: '', label: 'Agences' },
    { value: 10, suffix: '', label: 'Années d’expérience' },
  ];
  values = [
    { icon: '🛡️', title: 'Transparence', text: 'Aucun frais caché. Le prix affiché est le prix payé.' },
    { icon: '🌿', title: 'Éco-responsabilité', text: 'Une flotte qui intègre des véhicules hybrides et électriques.' },
    { icon: '📞', title: 'Support 24/7', text: 'Une assistance disponible à tout moment, où que vous soyez.' },
  ];
}