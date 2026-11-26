export interface Quote {
  days: number; carPerDay: number; optionsPerDay: number; subtotal: number;
  tier: string; loyaltyRate: number; durationRate: number; totalRate: number;
  discount: number; total: number; rentals: number; nextTier: string | null; rentalsToNext: number;
}
export interface Loyalty {
  tier: string; rate: number; rentals: number;
  nextTier: string | null; nextRate: number; toNext: number; progress: number;
}