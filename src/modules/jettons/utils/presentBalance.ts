export function presentBalance(amount: string) {
  return Number(amount).toFixed(9).replace(/\.?0+$/, '');
}
