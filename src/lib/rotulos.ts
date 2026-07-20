import type { Canal, FormaPagamento } from "./types";

export const ROTULO_CANAL: Record<Canal, string> = {
  salao: "Salão",
  ifood: "iFood",
  "99food": "99Food",
  empresa: "Empresa",
  fiado: "Fiado",
};

export const ROTULO_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  cartao: "Cartão",
};

export const CANAIS: Canal[] = ["salao", "ifood", "99food", "empresa", "fiado"];
export const FORMAS_PAGAMENTO: FormaPagamento[] = ["dinheiro", "pix", "cartao"];
