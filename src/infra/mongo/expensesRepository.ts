import { v4 as uuid } from "uuid";
import type { ExpensesRepository } from "../../domain/expenses/repository.js";
import type { Expense, ExpenseMonth, ExpenseWriteInput } from "../../domain/types.js";
import { monthsInRange, shiftDate } from "../../domain/period.js";
import { getDb } from "./client.js";

function collection() {
  return getDb().collection<Expense>("expenses");
}

function toPublic(expense: Expense, mes?: number, ano?: number): Expense {
  const meses =
    mes && ano
      ? expense.meses.filter((item) => item.mes === mes && item.ano === ano)
      : expense.meses;

  return {
    id: expense._id,
    ...expense,
    meses
  } as Expense & { id: string };
}

function buildMeses(id: string, input: ExpenseWriteInput): ExpenseMonth[] {
  const fallback = {
    mes: input.mes || (input.vencimento ? new Date(input.vencimento).getMonth() + 1 : 1),
    ano: input.ano || (input.vencimento ? new Date(input.vencimento).getFullYear() : new Date().getFullYear())
  };

  const periods =
    input.tipoLancamento === "1"
      ? [fallback]
      : monthsInRange(input.range, fallback);

  return periods.map((period) => ({
    mes: period.mes,
    ano: period.ano,
    valor: String(input.valor ?? "0.00"),
    status: input.status || "2",
    contaId: input.contaId || "",
    categoria: input.categoria || "",
    descricao: input.descricao || "",
    observacao: input.observacao || "",
    despesaId: id,
    vencimento: shiftDate(input.vencimento, period.mes, period.ano)
  }));
}

export const mongoExpensesRepository: ExpensesRepository = {
  async create(customerId, input) {
    const id = uuid();
    const expense: Expense = {
      _id: id,
      customerId,
      nome: input.nome,
      tipoLancamento: input.tipoLancamento || "1",
      replicar: Boolean(input.replicar),
      range: input.range,
      meses: buildMeses(id, input)
    };

    await collection().insertOne(expense);
    return { ...expense, id } as Expense & { id: string };
  },

  async update(customerId, input) {
    const id = input.despesaId || input.id;
    if (!id) return false;

    const current = await collection().findOne({ _id: id, customerId });
    if (!current) return false;

    const mes = input.mes;
    const ano = input.ano;
    const meses = current.meses.map((item) => {
      if (mes && ano && (item.mes !== mes || item.ano !== ano)) {
        return item;
      }

      return {
        ...item,
        valor: input.valor ?? item.valor,
        status: input.status ?? item.status,
        contaId: input.contaId ?? item.contaId,
        categoria: input.categoria ?? item.categoria,
        descricao: input.descricao ?? item.descricao,
        observacao: input.observacao ?? item.observacao,
        vencimento: input.vencimento ?? item.vencimento
      };
    });

    const result = await collection().updateOne(
      { _id: id, customerId },
      {
        $set: {
          nome: input.nome ?? current.nome,
          tipoLancamento: input.tipoLancamento ?? current.tipoLancamento,
          replicar: input.replicar ?? current.replicar,
          range: input.range ?? current.range,
          meses
        }
      }
    );

    return result.matchedCount > 0;
  },

  async remove(customerId, id, mes) {
    const current = await collection().findOne({ _id: id, customerId });
    if (!current) return false;

    if (mes == null) {
      const result = await collection().deleteOne({ _id: id, customerId });
      return result.deletedCount > 0;
    }

    const meses = current.meses.filter((item) => item.mes !== mes);
    if (!meses.length) {
      const result = await collection().deleteOne({ _id: id, customerId });
      return result.deletedCount > 0;
    }

    const result = await collection().updateOne(
      { _id: id, customerId },
      { $set: { meses } }
    );
    return result.matchedCount > 0;
  },

  async findByMonth(customerId, mes, ano) {
    const docs = await collection()
      .find({ customerId, meses: { $elemMatch: { mes, ano } } })
      .toArray();

    return docs.map((doc) => toPublic(doc, mes, ano));
  },

  async findAll(customerId) {
    const docs = await collection().find({ customerId }).toArray();
    return docs.map((doc) => toPublic(doc));
  }
};
