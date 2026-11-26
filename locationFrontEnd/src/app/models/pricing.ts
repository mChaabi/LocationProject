export type PromoStatus = 'NONE' | 'OK' | 'INVALID' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED';

export interface Quote {
  days: number; carPerDay: number; optionsPerDay: number; subtotal: number;
  tier: string; loyaltyRate: number; durationRate: number;
  promoCode: string | null; promoRate: number; promoStatus: PromoStatus;
  totalRate: number; discount: number; total: number;
  rentals: number; nextTier: string | null; rentalsToNext: number;
}
export interface Loyalty {
  tier: string; rate: number; rentals: number;
  nextTier: string | null; nextRate: number; toNext: number; progress: number;
}
export interface Rule { id?: number; kind: 'LOYALTY' | 'DURATION'; name: string; threshold: number; rate: number; }
export interface Rules { loyalty: Rule[]; duration: Rule[]; maxRate: number; }
export interface Promo {
  id?: number; code: string; percent: number; active: boolean;
  expiresAt: string | null; maxUses: number | null; uses: number;
}