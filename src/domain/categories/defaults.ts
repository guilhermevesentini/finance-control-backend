export const CategoryTipo = {
  income: 1,
  expense: 2
} as const;

export type DefaultCategory = {
  nome: string;
  color: string;
  tipo: number;
};

export const defaultExpenseCategories: DefaultCategory[] = [
  { nome: "Casa", color: "#008FFB", tipo: CategoryTipo.expense },
  { nome: "Cartão", color: "#775DD0", tipo: CategoryTipo.expense },
  { nome: "Lazer", color: "#FEB019", tipo: CategoryTipo.expense },
  { nome: "Mercado", color: "#00D8B6", tipo: CategoryTipo.expense },
  { nome: "Transporte", color: "#0079E0", tipo: CategoryTipo.expense },
  { nome: "Saúde", color: "#FF4560", tipo: CategoryTipo.expense },
  { nome: "Educação", color: "#6F4FAF", tipo: CategoryTipo.expense },
  { nome: "Assinaturas", color: "#00B89C", tipo: CategoryTipo.expense },
  { nome: "Vestuário", color: "#FF8C00", tipo: CategoryTipo.expense },
  { nome: "Outros", color: "#A9A9A9", tipo: CategoryTipo.expense }
];

export const defaultIncomeCategories: DefaultCategory[] = [
  { nome: "Salário", color: "#00B89C", tipo: CategoryTipo.income },
  { nome: "Freelance", color: "#008FFB", tipo: CategoryTipo.income },
  { nome: "Investimentos", color: "#FFD700", tipo: CategoryTipo.income },
  { nome: "Extra", color: "#FEB019", tipo: CategoryTipo.income },
  { nome: "Outros", color: "#A9A9A9", tipo: CategoryTipo.income }
];

export const defaultCategories: DefaultCategory[] = [
  ...defaultExpenseCategories,
  ...defaultIncomeCategories
];
