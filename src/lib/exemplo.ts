import type { Empresa, Lancamento } from "./types";
import { ITENS_PADRAO } from "./itens";

function porId(itemId: string) {
  const item = ITENS_PADRAO.find((i) => i.id === itemId);
  if (!item) throw new Error(`Item de exemplo não encontrado: ${itemId}`);
  return item;
}

function dataOffset(diasAtras: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function novoLancamento(parcial: {
  data: string;
  item_id: string;
  quantidade: number;
  canal: Lancamento["canal"];
  forma_pagamento?: Lancamento["forma_pagamento"];
  fiado_cliente?: string;
  empresa_nome?: string;
  quitado?: boolean;
  quitado_em?: string;
  forma_pagamento_quitacao?: Lancamento["forma_pagamento"];
  valor_unitario?: number;
}): Lancamento {
  const item = porId(parcial.item_id);
  return {
    id: crypto.randomUUID(),
    data: parcial.data,
    item_id: parcial.item_id,
    quantidade: parcial.quantidade,
    valor_unitario: parcial.valor_unitario ?? item.valor_unitario_padrao,
    canal: parcial.canal,
    forma_pagamento: parcial.forma_pagamento ?? null,
    fiado_cliente: parcial.fiado_cliente ?? null,
    empresa_nome: parcial.empresa_nome ?? null,
    quitado: parcial.quitado ?? false,
    quitado_em: parcial.quitado_em ?? null,
    forma_pagamento_quitacao: parcial.forma_pagamento_quitacao ?? null,
    criado_em: new Date().toISOString(),
  };
}

export function criarLancamentosExemplo(): Lancamento[] {
  const hoje = dataOffset(0);
  const ontem = dataOffset(1);
  const anteontem = dataOffset(2);
  const mesPassado = dataOffset(35);

  return [
    // Hoje — vendas variadas pra demonstrar o fechamento
    novoLancamento({ data: hoje, item_id: "almoco", quantidade: 8, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({ data: hoje, item_id: "almoco", quantidade: 3, canal: "ifood", forma_pagamento: "pix" }),
    novoLancamento({ data: hoje, item_id: "marmitex-m", quantidade: 5, canal: "salao", forma_pagamento: "cartao" }),
    novoLancamento({ data: hoje, item_id: "marmitex-m", quantidade: 2, canal: "99food", forma_pagamento: "pix" }),
    novoLancamento({ data: hoje, item_id: "refrigerante-1-5-2lt", quantidade: 4, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({ data: hoje, item_id: "cerveja-garrafa", quantidade: 6, canal: "salao", forma_pagamento: "cartao" }),
    novoLancamento({ data: hoje, item_id: "sorvete", quantidade: 3, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({
      data: hoje,
      item_id: "marmitex-g",
      quantidade: 4,
      canal: "empresa",
      empresa_nome: "Transportadora Silva",
    }),
    novoLancamento({
      data: hoje,
      item_id: "marmitex-m",
      quantidade: 3,
      canal: "empresa",
      empresa_nome: "Padaria Bom Pão",
    }),
    // Fiado aberto hoje
    novoLancamento({ data: hoje, item_id: "marmitex-p", quantidade: 1, canal: "fiado", fiado_cliente: "Seu Antônio" }),

    // Fiado de ontem, ainda aberto
    novoLancamento({ data: ontem, item_id: "almoco", quantidade: 2, canal: "fiado", fiado_cliente: "Dona Rita" }),

    // Fiado de anteontem, quitado hoje (entra no fechamento de hoje)
    novoLancamento({
      data: anteontem,
      item_id: "marmitex-g",
      quantidade: 1,
      canal: "fiado",
      fiado_cliente: "João da Padaria",
      quitado: true,
      quitado_em: hoje,
      forma_pagamento_quitacao: "dinheiro",
    }),

    // Dia anterior já fechado, pra demonstrar o Histórico
    novoLancamento({ data: anteontem, item_id: "almoco", quantidade: 10, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({ data: anteontem, item_id: "meio-almoco", quantidade: 4, canal: "salao", forma_pagamento: "pix" }),
    novoLancamento({ data: anteontem, item_id: "cerveja-garrafa", quantidade: 8, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({ data: anteontem, item_id: "brigadeiro", quantidade: 12, canal: "salao", forma_pagamento: "dinheiro" }),

    // Empresa do mês passado, já quitada (pra demonstrar que o saldo em aberto zera e o histórico continua)
    novoLancamento({
      data: mesPassado,
      item_id: "marmitex-g",
      quantidade: 6,
      canal: "empresa",
      empresa_nome: "Transportadora Silva",
      quitado: true,
      quitado_em: dataOffset(30),
      forma_pagamento_quitacao: "pix",
    }),
  ];
}

export function diaAnteontemExemplo(): string {
  return dataOffset(2);
}

export const EMPRESAS_EXEMPLO: Empresa[] = [
  { id: crypto.randomUUID(), nome: "Transportadora Silva", ativa: true, criado_em: new Date().toISOString() },
  { id: crypto.randomUUID(), nome: "Padaria Bom Pão", ativa: true, criado_em: new Date().toISOString() },
];
