import type { Canal, FechamentoDia, FormaPagamento, Lancamento, TotaisPorCanal, TotaisPorFormaPagamento } from "./types";

export function valorLancamento(l: Lancamento): number {
  return l.quantidade * l.valor_unitario;
}

function totaisFormaPagamentoVazio(): TotaisPorFormaPagamento {
  return { dinheiro: 0, pix: 0, cartao: 0 };
}

function totaisCanalVazio(): TotaisPorCanal {
  return { salao: 0, ifood: 0, "99food": 0, empresa: 0, fiado: 0 };
}

function somarPorForma(alvo: TotaisPorFormaPagamento, forma: FormaPagamento, valor: number): void {
  alvo[forma] += valor;
}

function somarPorCanal(alvo: TotaisPorCanal, canal: Canal, valor: number): void {
  alvo[canal] += valor;
}

export function calcularFechamento(data: string, todosLancamentos: Lancamento[]): FechamentoDia {
  const lancamentosDoDia = todosLancamentos.filter((l) => l.data === data);
  const quitadosHoje = todosLancamentos.filter((l) => l.fiado_quitado_em === data);

  const total_por_canal = totaisCanalVazio();
  const vendas_dia_por_forma_pagamento = totaisFormaPagamentoVazio();
  let total_geral = 0;
  let fiado_aberto = 0;

  for (const l of lancamentosDoDia) {
    const valor = valorLancamento(l);
    total_geral += valor;
    somarPorCanal(total_por_canal, l.canal, valor);
    if (l.forma_pagamento) {
      somarPorForma(vendas_dia_por_forma_pagamento, l.forma_pagamento, valor);
    }
    if (l.canal === "fiado" && !l.fiado_quitado) {
      fiado_aberto += valor;
    }
  }

  const fiados_quitados_hoje_por_forma_pagamento = totaisFormaPagamentoVazio();
  let fiado_quitado_hoje = 0;
  for (const l of quitadosHoje) {
    const valor = valorLancamento(l);
    fiado_quitado_hoje += valor;
    if (l.fiado_forma_pagamento) {
      somarPorForma(fiados_quitados_hoje_por_forma_pagamento, l.fiado_forma_pagamento, valor);
    }
  }

  const total_por_forma_pagamento: TotaisPorFormaPagamento = {
    dinheiro: vendas_dia_por_forma_pagamento.dinheiro + fiados_quitados_hoje_por_forma_pagamento.dinheiro,
    pix: vendas_dia_por_forma_pagamento.pix + fiados_quitados_hoje_por_forma_pagamento.pix,
    cartao: vendas_dia_por_forma_pagamento.cartao + fiados_quitados_hoje_por_forma_pagamento.cartao,
  };

  return {
    data,
    total_geral,
    total_por_canal,
    vendas_dia_por_forma_pagamento,
    fiados_quitados_hoje_por_forma_pagamento,
    total_por_forma_pagamento,
    fiado_aberto,
    fiado_quitado_hoje,
    dinheiro_esperado: total_por_forma_pagamento.dinheiro,
  };
}

export function calcularFiadoAbertoTotal(todosLancamentos: Lancamento[]): number {
  return todosLancamentos
    .filter((l) => l.canal === "fiado" && !l.fiado_quitado)
    .reduce((soma, l) => soma + valorLancamento(l), 0);
}
