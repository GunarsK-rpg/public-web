/**
 * Currency classifier
 */
export interface Currency {
  id: number;
  code: string;
  name: string;
  cost: number;
}

/**
 * Hero's currency holdings
 */
export interface HeroCurrency {
  id: number;
  heroId: number;
  currencyId: number;
  amount: number;
}
