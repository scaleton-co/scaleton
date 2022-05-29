import { Cell } from 'ton';

export function stringToCell(value: string) {
  const cell = new Cell();

  cell.bits.writeBuffer(Buffer.from(value));

  return cell;
}
