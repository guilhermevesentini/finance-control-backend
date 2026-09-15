export interface IDespesaMeses {
  ano: number
  valor: string
  status: string
  descricao: string  
  despesaId: string
  vencimento: Date | string | undefined;
  observacao: string
}

export interface IDespesas {
  id: string;
  nome: string;
  vencimento: Date | string | undefined
  recorrente: string | null
  frequencia: string
  replicar: boolean
  customerId: string
}

export interface IDespesasModel {
  id: string;
  nome: string;
  recorrente: string | null
  vencimento: Date | string | undefined
  frequencia: string
  replicar: boolean
  meses: IDespesaMeses[] | [];
  customerId: string
}

export default class DespesaModel {
  //private despesa: IDespesas[]

  createMeses(mes: IDespesaMeses): IDespesaMeses | null {
    if (!mes) return null

    return {
      ano: mes.ano,
      valor: mes.valor,
      status: mes.status,
      descricao: mes.descricao,  
      despesaId: mes.despesaId,
      vencimento: mes.vencimento,
      observacao: mes.observacao,
    }
  }

  createDespesas(despesa: IDespesas, meses: IDespesaMeses[]): IDespesasModel[] {
    const model: IDespesasModel[] = []

    // Filtra apenas os meses válidos (não nulos)
    const newMeses = meses.map((mes) => this.createMeses(mes)).filter((mes): mes is IDespesaMeses => mes !== null)

    model.push({ ...despesa, meses: newMeses })

    return model
  }
}
