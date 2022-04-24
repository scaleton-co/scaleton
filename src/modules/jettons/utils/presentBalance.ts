export function presentBalance(amount: string) {
  amount = amount.padStart(10, '0');

  const integer = amount.substring(0, amount.length - 9);
  const decimal = amount.substring(amount.length - 9, amount.length).replace(/0+$/, '');

  return decimal.length
    ? `${integer}.${decimal}`
    : integer;
}
