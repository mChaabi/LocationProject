import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-step-account', standalone: true, imports: [ReactiveFormsModule],
  template: `
    <header class="step-head">
      <span class="kicker">Étape 1</span>
      <h1>{{ mode() === 'register' ? 'Créez votre' : 'Content de vous' }} <em>{{ mode() === 'register' ? 'compte' : 'revoir' }}</em></h1>
      <p>Une minute suffit. Vous gardez ensuite le suivi de vos réservations et vos remises de fidélité.</p>
    </header>

    <div class="seg" [attr.data-mode]="mode()">
      <i></i>
      <button type="button" [class.on]="mode() === 'register'" (click)="setMode('register')">Créer un compte</button>
      <button type="button" [class.on]="mode() === 'login'" (click)="setMode('login')">J’ai déjà un compte</button>
    </div>

    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      @if (mode() === 'register') {
        <div class="two">
          <input formControlName="prenom" placeholder="Prénom" autocomplete="given-name">
          <input formControlName="nom" placeholder="Nom" autocomplete="family-name">
        </div>
        <input type="tel" formControlName="telephone" placeholder="Téléphone" autocomplete="tel">
      }
      <input type="email" formControlName="email" placeholder="Email" autocomplete="email">
      <input type="password" formControlName="password" placeholder="Mot de passe (6 caractères min.)" autocomplete="current-password">
      @if (error()) { <p class="err">{{ error() }}</p> }
      <button class="btn" [disabled]="form.invalid || busy()">
        {{ busy() ? 'Un instant…' : mode() === 'register' ? 'Créer mon compte et continuer' : 'Me connecter et continuer' }}
      </button>
    </form>

    <ul class="perks">
      <li>🏅 Remises de fidélité jusqu’à −15 %</li>
      <li>📲 Suivi en temps réel</li>
      <li>✍️ Contrat numérique, sans papier</li>
    </ul>`,
  styles: [`
    .seg { position:relative; display:grid; grid-template-columns:1fr 1fr; max-width:420px; padding:5px; margin-bottom:20px; border-radius:99px; background:#e8ebf3; }
    .seg i { position:absolute; top:5px; bottom:5px; left:5px; width:calc(50% - 5px); border-radius:99px; background:#fff; box-shadow:var(--shadow); transition:transform .45s var(--ease); }
    .seg[data-mode='login'] i { transform:translateX(100%); }
    .seg button { position:relative; padding:11px; border:0; background:none; cursor:pointer; font:600 .88rem 'Inter'; color:var(--muted); transition:color .3s; } .seg button.on { color:var(--ink); }
    .card { display:grid; gap:12px; max-width:520px; padding:28px; background:var(--card); border:1px solid var(--line); border-radius:var(--radius); box-shadow:var(--shadow); animation:fadeUp .6s var(--ease) .1s backwards; }
    .two { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    input { width:100%; padding:14px; border:2px solid var(--line); border-radius:12px; font:inherit; transition:border .3s; } input:focus { border-color:var(--primary); outline:0; }
    .err { color:var(--danger); margin:0; font-size:.85rem; }
    .perks { list-style:none; display:flex; flex-wrap:wrap; gap:10px; padding:0; margin:22px 0 0; }
    .perks li { padding:9px 14px; border-radius:99px; background:#eef2ff; color:#3730a3; font:600 .8rem 'Inter'; animation:fadeUp .5s var(--ease) .3s backwards; }
  `]
})
export class StepAccountComponent {
  private auth = inject(AuthService);
  completed = output<void>();

  mode = signal<'register' | 'login'>('register');
  busy = signal(false);
  error = signal('');

  form = inject(FormBuilder).nonNullable.group({
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    telephone: ['', [Validators.required, Validators.pattern(/^\+?[0-9 ]{8,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  setMode(m: 'register' | 'login') {
    this.mode.set(m); this.error.set('');
    (['prenom', 'nom', 'telephone'] as const).forEach(k => m === 'login' ? this.form.controls[k].disable() : this.form.controls[k].enable());
  }

  submit() {
    const v = this.form.getRawValue();
    this.busy.set(true); this.error.set('');
    const login$ = () => this.auth.login(v.email, v.password);
    const run$ = this.mode() === 'register'
      ? this.auth.register({ prenom: v.prenom, nom: v.nom, telephone: v.telephone, email: v.email, password: v.password }).pipe(switchMap(login$))
      : login$();
    run$.subscribe({
      next: () => { this.busy.set(false); this.completed.emit(); },
      error: e => {
        this.busy.set(false);
        this.error.set(typeof e.error === 'string' ? e.error.replace('Erreur serveur : ', '') : 'Opération impossible, réessayez.');
      }
    });
  }
}