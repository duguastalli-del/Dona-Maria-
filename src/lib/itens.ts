import type { Item } from "./types";

export const ITENS_PADRAO: Item[] = [
  { id: "almoco", nome: "Almoço", categoria: "prato", valor_unitario_padrao: 22 },
  { id: "meio-almoco", nome: "1/2 Almoço", categoria: "prato", valor_unitario_padrao: 15 },
  { id: "marmitex-p", nome: "Marmitex P", categoria: "prato", valor_unitario_padrao: 15 },
  { id: "marmitex-m", nome: "Marmitex M", categoria: "prato", valor_unitario_padrao: 18 },
  { id: "marmitex-g", nome: "Marmitex G", categoria: "prato", valor_unitario_padrao: 22 },
  { id: "marmitex-salada", nome: "Marmitex Salada", categoria: "prato", valor_unitario_padrao: 20 },
  { id: "esportivo-600ml", nome: "Esportivo 600ml", categoria: "bebida", valor_unitario_padrao: 6 },
  { id: "suco-garrafa", nome: "Suco de Garrafa", categoria: "bebida", valor_unitario_padrao: 8 },
  { id: "kss", nome: "KSs", categoria: "bebida", valor_unitario_padrao: 6 },
  { id: "latas", nome: "Latas", categoria: "bebida", valor_unitario_padrao: 5 },
  { id: "esportivo-2lt", nome: "Esportivo 2LT", categoria: "bebida", valor_unitario_padrao: 12 },
  { id: "refrigerante-1-5-2lt", nome: "Refrigerante 1,5 ou 2LT", categoria: "bebida", valor_unitario_padrao: 10 },
  { id: "h2o", nome: "H2O", categoria: "bebida", valor_unitario_padrao: 5 },
  { id: "agua-sem-gas", nome: "Água sem Gás", categoria: "bebida", valor_unitario_padrao: 3 },
  { id: "agua-com-gas", nome: "Água com Gás", categoria: "bebida", valor_unitario_padrao: 3.5 },
  { id: "cerveja-garrafa", nome: "Cerveja Garrafa", categoria: "bebida", valor_unitario_padrao: 8 },
  { id: "cachaca", nome: "Cachaça", categoria: "bebida", valor_unitario_padrao: 6 },
  { id: "brigadeiro", nome: "Brigadeiro", categoria: "doce", valor_unitario_padrao: 2 },
  { id: "doce-2", nome: "Docês R$ 2,00", categoria: "doce", valor_unitario_padrao: 2 },
  { id: "doce-2-50", nome: "Docês R$ 2,50", categoria: "doce", valor_unitario_padrao: 2.5 },
  { id: "cone", nome: "Cone", categoria: "doce", valor_unitario_padrao: 6 },
  { id: "cocada", nome: "Cocada", categoria: "doce", valor_unitario_padrao: 4 },
  { id: "sorvete", nome: "Sorvete", categoria: "doce", valor_unitario_padrao: 5 },
];

export const NOMES_CATEGORIA: Record<Item["categoria"], string> = {
  prato: "Pratos",
  bebida: "Bebidas",
  doce: "Doces",
};
