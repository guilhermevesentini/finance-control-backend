import type { ExpensesRepository } from "../domain/expenses/repository.js";
import type { IncomesRepository } from "../domain/incomes/repository.js";
import { iterateRange, toNumber } from "../domain/period.js";

function inRange(
  mes: number,
  ano: number,
  start: { mes: number; ano: number },
  end: { mes: number; ano: number }
) {
  const value = ano * 12 + mes;
  return value >= start.ano * 12 + start.mes && value <= end.ano * 12 + end.mes;
}

export function createOverviewService(
  expensesRepository: ExpensesRepository,
  incomesRepository: IncomesRepository
) {
  return {
    async spark(customerId: string, inicio: string, fim: string) {
      const periods = iterateRange(inicio, fim);
      const [expenses, incomes] = await Promise.all([
        expensesRepository.findAll(customerId),
        incomesRepository.findAll(customerId)
      ]);

      const start = periods[0];
      const end = periods[periods.length - 1];

      const expenseMonths = expenses.flatMap((item) => item.meses);
      const incomeMonths = incomes.flatMap((item) => item.meses);

      const expenseValues = periods.map((period) =>
        expenseMonths
          .filter((item) => item.mes === period.mes && item.ano === period.ano)
          .reduce((sum, item) => sum + toNumber(item.valor), 0)
      );
      const incomeValues = periods.map((period) =>
        incomeMonths
          .filter((item) => item.mes === period.mes && item.ano === period.ano)
          .reduce((sum, item) => sum + toNumber(item.valor), 0)
      );
      const pendingValues = periods.map((period) =>
        expenseMonths
          .filter(
            (item) =>
              item.mes === period.mes && item.ano === period.ano && item.status !== "1"
          )
          .reduce((sum, item) => sum + toNumber(item.valor), 0)
      );

      const totalDespesas = expenseValues.reduce((sum, value) => sum + value, 0);
      const totalReceitas = incomeValues.reduce((sum, value) => sum + value, 0);
      const pendente = pendingValues.reduce((sum, value) => sum + value, 0);

      return {
        totalDespesas: { value: totalDespesas, values: expenseValues },
        totalReceitas: { value: totalReceitas, values: incomeValues },
        pendente: { value: pendente, values: pendingValues },
        balanco: {
          value: totalReceitas - totalDespesas,
          values: periods.map((_, index) => incomeValues[index] - expenseValues[index])
        }
      };
    },

    async donut(customerId: string, inicio: string, fim: string) {
      const periods = iterateRange(inicio, fim);
      const start = periods[0];
      const end = periods[periods.length - 1];
      const expenses = await expensesRepository.findAll(customerId);
      const totals = new Map<string, number>();

      expenses.forEach((expense) => {
        expense.meses.forEach((month) => {
          if (!inRange(month.mes, month.ano, start, end)) return;
          const key = month.categoria || "Sem categoria";
          totals.set(key, (totals.get(key) || 0) + toNumber(month.valor));
        });
      });

      return {
        labels: Array.from(totals.keys()),
        values: Array.from(totals.values())
      };
    },

    async resumo(customerId: string, ano: number) {
      const [expenses, incomes] = await Promise.all([
        expensesRepository.findAll(customerId),
        incomesRepository.findAll(customerId)
      ]);

      const despesas = Array.from({ length: 12 }, () => 0);
      const receitas = Array.from({ length: 12 }, () => 0);

      expenses.forEach((expense) => {
        expense.meses.forEach((month) => {
          if (month.ano !== ano) return;
          despesas[month.mes - 1] += toNumber(month.valor);
        });
      });

      incomes.forEach((income) => {
        income.meses.forEach((month) => {
          if (month.ano !== ano) return;
          receitas[month.mes - 1] += toNumber(month.valor);
        });
      });

      return {
        despesas,
        receitas,
        balanco: despesas.map((value, index) => receitas[index] - value)
      };
    }
  };
}
