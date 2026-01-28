import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isSubmitting = false;
  errorMessage = '';

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Inscription réussie', response);
          this.router.navigate(['/home']); // Redirection après succès
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de l'inscription. L'email est peut-être déjà utilisé.";
          this.isSubmitting = false;
        }
      });
    }
  }
}

