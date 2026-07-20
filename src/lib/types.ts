export type Categoria = "prato" | "bebida" | "doce";

export type Canal = "salao" | "ifood" | "99food" | "empresa" | "fiado";

export type FormaPagamento = "dinheiro" | "pix" | "cartao";

export interface Item {
  id: string;
  nome: string;
  categoria: Categoria;
  valor_unitario_padrao: number;
}

export interface Lancamento {
  id: string;
  data: string; // YYYY-MM-DD
  item_id: string;
  quantidade: number;
  valor_unitario: number;
  canal: Canal;
  forma_pagamento: FormaPagamento | null; // null quando canal = fiado
  fiado_cliente: string | null;
  fiado_quitado: boolean;
  fiado_quitado_em: string | null; // YYYY-MM-DD
  fiado_forma_pagamento: FormaPagamento | null;
  empresa_nome: string | null; // nome da empresa quando canal = empresa
  criado_em: string; // ISO timestamp
}

export interface Empresa {
  id: string;
  nome: string;
  ativa: boolean;
  criado_em: string; // ISO timestamp
}

export interface DiaStatus {
  data: string; // YYYY-MM-DD
  fechado: boolean;
  dinheiro_contado: number | null;
  fechado_em: string | null; // ISO timestamp
  troco_inicial: number | null; // fundo de troco colocado no caixa no início do dia — não é faturamento
}

export type TotaisPorFormaPagamento = Record<FormaPagamento, number>;

export type TotaisPorCanal = Record<Canal, number>;

export interface FechamentoDia {
  data: string;
  total_geral: number;
  total_por_canal: TotaisPorCanal;
  vendas_dia_por_forma_pagamento: TotaisPorFormaPagamento;
  fiados_quitados_hoje_por_forma_pagamento: TotaisPorFormaPagamento;
  total_por_forma_pagamento: TotaisPorFormaPagamento;
  fiado_aberto: number;
  fiado_quitado_hoje: number;
  dinheiro_esperado: number;
}
