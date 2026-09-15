import type { ExpenseMonth, IncomeMonth, MonthRange } from "./types.js";

export function parseDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function monthsInRange(
  range: MonthRange | undefined,
  fallback: { mes: number; ano: number }
): Array<{ mes: number; ano: number }> {
  const startRaw = range?.[0];
  const endRaw = range?.[1];
  const start = parseDate(startRaw);
  const end = parseDate(endRaw);

  if (!start || !end) {
    return [fallback];
  }

  const months: Array<{ mes: number; ano: number }> = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    months.push({ mes: cursor.getMonth() + 1, ano: cursor.getFullYear() });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months.length ? months : [fallback];
}

export function shiftDate(
  value: Date | string | undefined,
  mes: number,
  ano: number
): string | undefined {
  const date = parseDate(value) ?? new Date(ano, mes - 1, 1);
  const day = date.getDate();
  const shifted = new Date(ano, mes - 1, day);
  return shifted.toISOString();
}

export function toNumber(value: string | number | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function filterExpenseMonths(
  meses: ExpenseMonth[],
  mes: number,
  ano: number
): ExpenseMonth[] {
  return meses.filter((item) => item.mes === mes && item.ano === ano);
}

export function filterIncomeMonths(
  meses: IncomeMonth[],
  mes: number,
  ano: number
): IncomeMonth[] {
  return meses.filter((item) => item.mes === mes && item.ano === ano);
}

export function monthKey(mes: number, ano: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}`;
}

export function iterateRange(inicio: string, fim: string): Array<{ mes: number; ano: number }> {
  return monthsInRange([inicio, fim], {
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  });
}
