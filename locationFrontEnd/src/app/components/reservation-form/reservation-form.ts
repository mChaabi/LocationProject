import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation-service';
import { AuthService } from '../../services/auth-service';
import { Reservation } from '../../models/reservation';
import { CarService } from '../../services/car-service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css'
})
export class ReservationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private carService = inject(CarService);

  reservationForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  cars = this.carService.cars;

  ngOnInit(): void {
    this.initForm();
    if (this.cars().length === 0) {
      this.carService.getAllCars();
    }
  }

  initForm() {
    this.reservationForm = this.fb.group({
      carId: ['', Validators.required], // À récupérer via l'URL ou un état
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      this.isSubmitting = true;

      const newReservation: Reservation = {
        ...this.reservationForm.value,
        userId: this.authService.currentUser()?.id, // Récupère l'ID de l'utilisateur connecté
        statut: 'en_attente',
        prixTotal: 0 // À calculer selon la durée et le prix de la voiture
      };

      this.reservationService.createReservation(newReservation).subscribe({
        next: () => {
          this.successMessage = 'Votre réservation a été enregistrée avec succès !';
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    }
  }
}
