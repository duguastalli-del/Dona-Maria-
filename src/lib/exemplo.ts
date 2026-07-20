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
  fiado_quitado?: boolean;
  fiado_quitado_em?: string;
  fiado_forma_pagamento?: Lancamento["forma_pagamento"];
  empresa_nome?: string;
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
    fiado_quitado: parcial.fiado_quitado ?? false,
    fiado_quitado_em: parcial.fiado_quitado_em ?? null,
    fiado_forma_pagamento: parcial.fiado_forma_pagamento ?? null,
    empresa_nome: parcial.empresa_nome ?? null,
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
      forma_pagamento: "pix",
      empresa_nome: "Transportadora Silva",
    }),
    novoLancamento({
      data: hoje,
      item_id: "marmitex-m",
      quantidade: 3,
      canal: "empresa",
      forma_pagamento: "dinheiro",
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
      fiado_quitado: true,
      fiado_quitado_em: hoje,
      fiado_forma_pagamento: "dinheiro",
    }),

    // Dia anterior já fechado, pra demonstrar o Histórico
    novoLancamento({ data: anteontem, item_id: "almoco", quantidade: 10, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({ data: anteontem, item_id: "meio-almoco", quantidade: 4, canal: "salao", forma_pagamento: "pix" }),
    novoLancamento({ data: anteontem, item_id: "cerveja-garrafa", quantidade: 8, canal: "salao", forma_pagamento: "dinheiro" }),
    novoLancamento({ data: anteontem, item_id: "brigadeiro", quantidade: 12, canal: "salao", forma_pagamento: "dinheiro" }),

    // Empresa do mês passado, pra demonstrar o fechamento por período em Empresas
    novoLancamento({
      data: mesPassado,
      item_id: "marmitex-g",
      quantidade: 6,
      canal: "empresa",
      forma_pagamento: "dinheiro",
      empresa_nome: "Transportadora Silva",
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
