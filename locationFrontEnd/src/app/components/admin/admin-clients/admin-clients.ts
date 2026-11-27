import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ClientDocsComponent } from '../../../shared/client-docs';
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user';


@Component({
  selector: 'app-admin-clients', standalone: true, imports: [ClientDocsComponent],
  template: `
    <div class="bar">
      <h2>Clients</h2>
      <input class="search" placeholder="🔍 Rechercher un client…" (input)="q.set($any($event.target).value)">
    </div>

    @if (list() === null) { <p class="empty">Chargement…</p> }
    @else {
      <div class="table">
        @for (u of filtered(); track u.id; let i = $index) {
          <div class="row" [style.--i]="i">
            <span class="avatar">{{ initials(u) }}</span>
            <div class="grow"><b>{{ u.prenom }} {{ u.nom }}</b><small>{{ u.email }} · {{ u.telephone }}</small></div>
            <button class="soft" (click)="selected.set(u)">📂 Documents</button>
          </div>
        } @empty { <p class="empty">Aucun client.</p> }
      </div>
    }

    @if (selected(); as u) {
      <div class="drawer-overlay" (click)="selected.set(null)">
        <aside class="drawer" (click)="$event.stopPropagation()">
          <header class="dhead"><span class="avatar">{{ initials(u) }}</span>
            <div><b>{{ u.prenom }} {{ u.nom }}</b><br><small>{{ u.email }}</small></div>
            <button class="x" (click)="selected.set(null)" aria-label="Fermer">✕</button></header>
          <div class="dbody"><app-client-docs [userId]="'' + u.id" mode="admin" /></div>
        </aside>
      </div>
    }`,
  styles: [`.search { padding:12px 18px; border:2px solid var(--line); border-radius:99px; font:inherit; min-width:260px; } .search:focus { border-color:var(--primary); outline:0; }`]
})
export class AdminClientsComponent implements OnInit {
  private users = inject(UserService);
  list = signal<User[] | null>(null);
  q = signal('');
  selected = signal<User | null>(null);
  filtered = computed(() => (this.list() ?? []).filter(u => u.role === 'client' &&
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(this.q().toLowerCase())));

  ngOnInit() { this.users.all().subscribe({ next: l => this.list.set(l), error: () => this.list.set([]) }); }
  initials(u: User) { return ((u.prenom?.[0] ?? '') + (u.nom?.[0] ?? '')).toUpperCase(); }
}