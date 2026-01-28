import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class AboutComponent {
  stats = [
    { label: 'Véhicules en Flotte', value: '150+' },
    { label: 'Clients Satisfaits', value: '5K+' },
    { label: 'Agences en France', value: '12' },
    { label: 'Années d’Expérience', value: '10' }
  ];
}
