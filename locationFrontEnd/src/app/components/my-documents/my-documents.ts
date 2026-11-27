import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { ClientDocsComponent } from '../../shared/client-docs';
import { MediaItem } from '../../models/media';

@Component({
  selector: 'app-my-documents', standalone: true, imports: [ClientDocsComponent],
  template: `
    <section class="page">
      <header class="head"><h1>Mes <em>documents</em></h1>
        <p>Envoyez votre permis et votre pièce d’identité pour accélérer la remise des clés.</p></header>

      <div class="status">
        <div><b>{{ sent() }}/2</b> documents envoyés · <b>{{ verified() }}</b> vérifié(s)</div>
        <div class="track"><i [style.width.%]="sent() * 50"></i></div>
      </div>

      <app-client-docs [userId]="uid" mode="client" (itemsChange)="items.set($event)" />
    </section>`,
  styles: [`
    .page { max-width:760px; margin:0 auto; padding:56px 24px 90px; }
    .head { text-align:center; margin-bottom:32px; animation:fadeUp .7s var(--ease) backwards; } .head p { color:var(--muted); }
    .status { background:linear-gradient(135deg,#0b1220,#312e81); color:#fff; padding:22px 24px; border-radius:20px; margin-bottom:22px; animation:fadeUp .7s var(--ease) .1s backwards; }
    .track { height:8px; margin-top:12px; background:rgba(255,255,255,.2); border-radius:99px; overflow:hidden; }
    .track i { display:block; height:100%; background:#fff; border-radius:99px; transition:width .8s var(--ease); }
  `]
})
export class MyDocumentsComponent {
  uid = String(inject(AuthService).currentUser()!.id);
  items = signal<MediaItem[]>([]);
  private kinds = ['LICENSE', 'ID_CARD'];
  sent = computed(() => this.kinds.filter(k => this.items().some(i => i.kind === k)).length);
  verified = computed(() => this.kinds.filter(k => this.items().some(i => i.kind === k && i.review === 'VERIFIED')).length);
}