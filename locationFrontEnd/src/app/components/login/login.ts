import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login', standalone: true, imports: [ReactiveFormsModule, RouterLink],
  template: `
  <div class="wrap">
    <form class="box" [formGroup]="form" (ngSubmit)="submit()">
      <h1>Connexion <em>AutoDrive</em></h1>
      <input type="email" formControlName="email" placeholder="Email">
      <input type="password" formControlName="password" placeholder="Mot de passe">
      @if (error()) { <p class="err">{{ error() }}</p> }
      <button class="btn" [disabled]="form.invalid">Se connecter</button>
      <p class="alt">Pas de compte ? <a routerLink="/register">Inscription</a></p>
    </form>
  </div>`,
  styles: [`
    .wrap { min-height:70vh; display:grid; place-items:center; padding:24px; }
    .box { width:100%; max-width:420px; background:var(--card); padding:40px; border-radius:var(--radius);
      box-shadow:var(--shadow); border:1px solid var(--line); animation:fadeUp .7s var(--ease) both; }
    h1 { font-size:1.7rem; margin-bottom:24px; }
    input { width:100%; padding:14px; margin-bottom:14px; border:2px solid var(--line); border-radius:12px; font:inherit; transition:border .3s; }
    input:focus { border-color:var(--primary); outline:0; }
    .btn { width:100%; } .err { color:var(--danger); font-size:.85rem; }
    .alt { text-align:center; color:var(--muted); font-size:.9rem; } .alt a { color:var(--primary); font-weight:600; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]], password: ['', Validators.required]
  });

  submit() {
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: u => this.router.navigate([u.role === 'admin' ? '/admin' : '/cars']),
      error: e => this.error.set(typeof e.error === 'string' ? e.error : 'Connexion impossible')
    });
  }
}