/**
 * Currency utility functions for Nexora Financial Solutions
 * Supports primary UGX (Ugandan Shilling) and secondary USD.
 * Standard Exchange Rate convention for East African Oil & Gas operations: 1 USD = 3,750 UGX.
 */

export const USD_TO_UGX_RATE = 3750;

/**
 * Format an amount as Ugandan Shillings (UGX)
 * e.g., formatUGX(37500000) => "UGX 37,500,000"
 * With compact option: formatUGX(37500000, true) => "UGX 37.5M"
 */
export function formatUGX(amount: number | undefined | null, compact = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'UGX 0';

  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `UGX ${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `UGX ${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `UGX ${(amount / 1_000).toFixed(0)}K`;
    }
  }

  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Format an amount as US Dollars (USD)
 * e.g., formatUSD(10000) => "$10,000"
 * With compact option: formatUSD(1000000, true) => "$1.0M"
 */
export function formatUSD(amount: number | undefined | null, compact = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';

  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
  }

  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Convert USD to UGX
 */
export function convertUSDToUGX(usd: number): number {
  return Math.round(usd * USD_TO_UGX_RATE);
}

export const convertUsdToUgx = convertUSDToUGX;

/**
 * Convert UGX to USD
 */
export function convertUGXToUSD(ugx: number): number {
  return Math.round(ugx / USD_TO_UGX_RATE);
}

export const convertUgxToUsd = convertUGXToUSD;

/**
 * Dual currency display formatted string
 * e.g., formatDualCurrency(37500000) => "UGX 37,500,000 ($10,000)"
 */
export function formatDualCurrency(ugxAmount: number, compact = false): string {
  const ugxStr = formatUGX(ugxAmount, compact);
  const usdVal = convertUGXToUSD(ugxAmount);
  const usdStr = formatUSD(usdVal, compact);
  return `${ugxStr} (${usdStr})`;
}
