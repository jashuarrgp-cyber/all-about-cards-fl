import { Prisma } from '@prisma/client';
export function decimal(value: string | number | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}
export function lineTotal(
  unitCost: string | number | Prisma.Decimal,
  quantity: number,
) {
  return decimal(unitCost).mul(quantity).toDecimalPlaces(2);
}
export function assertPurchaseTotals(
  lines: {
    unitCost: string | number | Prisma.Decimal;
    quantity: number;
    lineTotal: string | number | Prisma.Decimal;
  }[],
  tax: string | number | Prisma.Decimal,
  shipping: string | number | Prisma.Decimal,
  fees: string | number | Prisma.Decimal,
  totalCost: string | number | Prisma.Decimal,
) {
  const subtotal = lines.reduce(
    (sum, line) => sum.add(lineTotal(line.unitCost, line.quantity)),
    new Prisma.Decimal(0),
  );
  const total = subtotal.add(tax).add(shipping).add(fees).toDecimalPlaces(2);
  if (!total.equals(decimal(totalCost).toDecimalPlaces(2)))
    throw new Error('Purchase total does not match server-calculated total.');
  return { subtotal, total };
}
