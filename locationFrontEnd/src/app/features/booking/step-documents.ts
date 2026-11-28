import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { ClientDocsComponent } from '../../shared/client-docs';
import { BookingStore } from './booking-store';

@Component({
  selector: 'app-step-documents', standalone: true, imports: [ClientDocsComponent],
  template: `
    <header class="step-head">
      <span class="kicker">Étape 3</span>
      <h1>Vos <em>documents</em></h1>
      <p>Permis de conduire et pièce d’identité : l’agence les vérifie avant la remise des clés.</p>
    </header>

    <app-client-docs [userId]="uid" mode="client" (itemsChange)="store.docs.set($event)" />

    <div class="cta">
      <button class="btn" [disabled]="!store.done().documents" (click)="completed.emit()">Continuer</button>
      @if (!store.done().documents) { <small>Ajoutez votre permis et votre pièce d’identité pour continuer.</small> }
    </div>`,
  styles: [`.cta { display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-top:24px; } small { color:var(--muted); }`]
})
export class StepDocumentsComponent {
  readonly store = inject(BookingStore);
  uid = String(inject(AuthService).currentUser()!.id);
  completed = output<void>();
}