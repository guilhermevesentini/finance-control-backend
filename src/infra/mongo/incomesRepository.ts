import { v4 as uuid } from "uuid";
import type { IncomesRepository } from "../../domain/incomes/repository.js";
import type { Income, IncomeMonth, IncomeWriteInput } from "../../domain/types.js";
import { monthsInRange, shiftDate } from "../../domain/period.js";
import { getDb } from "./client.js";

function collection() {
  return getDb().collection<Income>("incomes");
}

function toPublic(income: Income, mes?: number, ano?: number): Income {
  const meses =
    mes && ano
      ? income.meses.filter((item) => item.mes === mes && item.ano === ano)
      : income.meses;

  return {
    id: income._id,
    ...income,
    meses
  } as Income & { id: string };
}

function buildMeses(id: string, input: IncomeWriteInput): IncomeMonth[] {
  if (input.meses?.length) {
    return input.meses.map((item) => ({ ...item, incomeId: id }));
  }

  const fallback = {
    mes: input.mes || (input.recebimento ? new Date(input.recebimento).getMonth() + 1 : 1),
    ano: input.ano || (input.recebimento ? new Date(input.recebimento).getFullYear() : new Date().getFullYear())
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
    incomeId: id,
    recebimento: shiftDate(input.recebimento, period.mes, period.ano)
  }));
}

export const mongoIncomesRepository: IncomesRepository = {
  async create(customerId, input) {
    const id = uuid();
    const income: Income = {
      _id: id,
      customerId,
      nome: input.nome,
      tipoLancamento: input.tipoLancamento || "1",
      replicar: Boolean(input.replicar),
      range: input.range,
      contaId: input.contaId,
      meses: buildMeses(id, input)
    };

    await collection().insertOne(income);
    return { ...income, id } as Income & { id: string };
  },

  async update(customerId, input) {
    const id = input.incomeId || input.id;
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
        recebimento: input.recebimento ?? item.recebimento
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
          contaId: input.contaId ?? current.contaId,
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
