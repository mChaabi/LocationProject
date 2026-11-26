import { Component, OnInit, computed, inject } from '@angular/core';
import { RevealDirective } from '../reveal';
import { CounterDirective } from '../counter';
import { PricingService } from '../../services/pricing';


@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [RevealDirective, CounterDirective],
  template: `
    @if (rules(); as r) {
      <section class="section container center">
        <span class="kicker">Programme fidélité</span>
        <h2 class="title">Plus vous louez, <em>moins vous payez</em></h2>
        <p class="lead">Jusqu’à {{ r.maxRate }}% de remise cumulée, appliquée automatiquement.</p>

        <div class="ladder">
          @for (t of tiers(); track t.name; let i = $index) {
            <div class="tier" appReveal [style.--i]="i" [attr.data-tier]="t.name">
              <div class="medal">{{ icons[i] ?? '🏆' }}</div>
              <h3>{{ t.name }}</h3>
              <b class="rate" [appCounter]="t.rate" suffix="%"></b>
              <small>{{ t.threshold === 0 ? 'Dès l’inscription' : 'dès ' + t.threshold + ' location' + (t.threshold > 1 ? 's' : '') }}</small>
            </div>
          }
        </div>

        <div class="duration">
          @for (d of r.duration; track d.id; let i = $index) {
            <span class="dchip" appReveal [style.--i]="i">📆 −{{ d.rate }}% dès {{ d.threshold }} jours</span>
          }
          <span class="dchip" appReveal [style.--i]="3">🏷️ Codes promo cumulables</span>
        </div>
      </section>
    }`,
  styles: [`
    :host { display:block; }
    .center { text-align:center; }
    .ladder { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:20px; margin:44px 0 28px; }
    .tier { position:relative; overflow:hidden; padding:30px 20px; border-radius:20px; background:#fff; border:1px solid var(--line);
      box-shadow:var(--shadow); transition:transform .45s var(--ease), box-shadow .45s var(--ease); }
    .tier::before { content:''; position:absolute; inset:0 0 auto 0; height:5px; background:var(--accent,#94a3b8); }
    .tier:hover { transform:translateY(-10px) scale(1.02); box-shadow:0 26px 50px rgba(15,23,42,.14); }
    .tier[data-tier='Nouveau'] { --accent:#10b981; } .tier[data-tier='Bronze'] { --accent:#c2410c; }
    .tier[data-tier='Silver'] { --accent:#64748b; }  .tier[data-tier='Gold'] { --accent:#f59e0b; }
    .medal { font-size:2.2rem; margin-bottom:8px; transition:transform .5s var(--ease); }
    .tier:hover .medal { transform:scale(1.25) rotate(-8deg); }
    .rate { display:block; font-size:2.6rem; letter-spacing:-.03em; margin:6px 0; color:var(--accent,var(--primary)); }
    small { color:var(--muted); }
    .duration { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
    .dchip { padding:10px 18px; border-radius:99px; background:#eef2ff; color:#3730a3; font:600 .85rem 'Inter'; }
  `]
})
export class BenefitsComponent implements OnInit {
  private pricing = inject(PricingService);
  rules = this.pricing.rules;
  icons = ['🌱', '🥉', '🥈', '🥇'];
  tiers = computed(() => [{ name: 'Nouveau', threshold: 0, rate: 0 }, ...(this.rules()?.loyalty ?? [])]);

  ngOnInit() { this.pricing.loadRules(); }
}