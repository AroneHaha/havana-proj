export function calculateDiscount(price: number, compareAtPrice: number): number {
  if (!compareAtPrice || compareAtPrice <= 0 || price < 0 || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
