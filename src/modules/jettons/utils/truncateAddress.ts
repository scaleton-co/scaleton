export function truncateAddress(address: string) {
  return address.replace(/^(.{4}).*(.{4})$/, '$1...$2');
}
