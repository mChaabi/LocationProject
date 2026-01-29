import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact-service';
import { Contact } from '../../models/contact';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);

  contactForm: FormGroup = this.fb.group({
    nomComplet: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    sujet: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  isSubmitting = false;
  successMessage = '';

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      const formData: Contact = {
        ...this.contactForm.value,
        dateEnvoi: new Date()
      };

      this.contactService.sendContact(formData).subscribe({
        next: () => {
          this.successMessage = 'Votre message a été envoyé avec succès !';
          this.contactForm.reset();
          this.isSubmitting = false;
        },
        error: () => {
          alert("Une erreur est survenue lors de l'envoi.");
          this.isSubmitting = false;
        }
      });
    }
  }
}
