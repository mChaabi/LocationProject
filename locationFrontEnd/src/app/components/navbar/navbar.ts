import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-navbar', standalone: true, imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html', styleUrl: './navbar.css'
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  menuOpen = signal(false);
  userOpen = signal(false);
  scrolled = signal(false);

  links = [
    { path: '/home', label: 'Accueil' }, { path: '/cars', label: 'Voitures' },
    { path: '/about', label: 'À propos' }, { path: '/contact', label: 'Contact' }
  ];
  initials = computed(() => {
    const u = this.auth.currentUser();
    return u ? ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase() : '';
  });

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => { this.menuOpen.set(false); this.userOpen.set(false); });
  }

  @HostListener('window:scroll') onScroll() { this.scrolled.set(window.scrollY > 12); }
  @HostListener('document:click', ['$event']) onDocClick(e: Event) {
    if (!this.host.nativeElement.contains(e.target as Node)) this.userOpen.set(false);
  }
  @HostListener('document:keydown.escape') onEsc() { this.menuOpen.set(false); this.userOpen.set(false); }

  logout() { this.auth.logout(); this.router.navigate(['/home']); }
}