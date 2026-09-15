import { defaultCategories } from "./defaults.js";
import type { CategoriesRepository } from "./repository.js";

export async function ensureDefaultCategories(
  categories: CategoriesRepository,
  customerId: string,
  tipo?: number
): Promise<void> {
  const existing = await categories.findAll(customerId, tipo);
  if (existing.length > 0) return;

  const items =
    tipo == null
      ? defaultCategories
      : defaultCategories.filter((category) => category.tipo === tipo);

  if (!items.length) return;

  await categories.createMany(customerId, items);
}
