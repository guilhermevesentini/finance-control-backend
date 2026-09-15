export type MonthRange = [string | undefined, string | undefined] | [];

export type ExpenseMonth = {
  mes: number;
  ano: number;
  valor: string;
  status: string;
  contaId: string;
  categoria: string;
  descricao: string;
  despesaId: string;
  vencimento: Date | string | undefined;
  observacao: string;
};

export type Expense = {
  _id: string;
  customerId: string;
  nome: string;
  tipoLancamento: string;
  replicar: boolean;
  range?: MonthRange;
  meses: ExpenseMonth[];
};

export type IncomeMonth = {
  mes: number;
  ano: number;
  valor: string;
  status: string;
  contaId: string;
  categoria: string;
  descricao: string;
  incomeId: string;
  recebimento: Date | string | undefined;
  observacao: string;
};

export type Income = {
  _id: string;
  customerId: string;
  nome: string;
  tipoLancamento: string;
  replicar: boolean;
  range?: MonthRange;
  contaId?: string;
  meses: IncomeMonth[];
};

export type Account = {
  _id: string;
  customerId: string;
  banco: number | undefined;
  nomeBanco: string;
  nome: string;
  conta: string | undefined;
  agencia: string;
  saldo: string;
  contaPrincipal: boolean;
};

export type Category = {
  _id: string;
  customerId: string;
  tipo: number;
  nome: string;
  color: string;
};

export type User = {
  _id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
};

export type CreateUserInput = {
  email: string;
  username?: string;
  password: string;
};

export type ExpenseWriteInput = {
  id?: string | null;
  despesaId?: string | null;
  nome: string;
  tipoLancamento?: string;
  replicar?: boolean;
  range?: MonthRange;
  mes?: number;
  ano?: number;
  valor?: string;
  status?: string;
  contaId?: string;
  categoria?: string;
  descricao?: string;
  vencimento?: Date | string;
  observacao?: string;
};

export type IncomeWriteInput = {
  id?: string | null;
  incomeId?: string | null;
  nome: string;
  tipoLancamento?: string;
  replicar?: boolean;
  range?: MonthRange;
  mes?: number;
  ano?: number;
  valor?: string;
  status?: string;
  contaId?: string;
  categoria?: string;
  descricao?: string;
  recebimento?: Date | string;
  observacao?: string;
  meses?: IncomeMonth[];
};
