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
  const quitadosHoje = todosLancamentos.filter((l) => l.quitado_em === data);

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
    if (l.canal === "fiado" && !l.quitado) {
      fiado_aberto += valor;
    }
  }

  const quitados_hoje_por_forma_pagamento = totaisFormaPagamentoVazio();
  let quitado_hoje = 0;
  for (const l of quitadosHoje) {
    const valor = valorLancamento(l);
    quitado_hoje += valor;
    if (l.forma_pagamento_quitacao) {
      somarPorForma(quitados_hoje_por_forma_pagamento, l.forma_pagamento_quitacao, valor);
    }
  }

  const total_por_forma_pagamento: TotaisPorFormaPagamento = {
    dinheiro: vendas_dia_por_forma_pagamento.dinheiro + quitados_hoje_por_forma_pagamento.dinheiro,
    pix: vendas_dia_por_forma_pagamento.pix + quitados_hoje_por_forma_pagamento.pix,
    cartao: vendas_dia_por_forma_pagamento.cartao + quitados_hoje_por_forma_pagamento.cartao,
  };

  return {
    data,
    total_geral,
    total_por_canal,
    vendas_dia_por_forma_pagamento,
    quitados_hoje_por_forma_pagamento,
    total_por_forma_pagamento,
    fiado_aberto,
    quitado_hoje,
    dinheiro_esperado: total_por_forma_pagamento.dinheiro,
  };
}

export function calcularFiadoAbertoTotal(todosLancamentos: Lancamento[]): number {
  return todosLancamentos
    .filter((l) => l.canal === "fiado" && !l.quitado)
    .reduce((soma, l) => soma + valorLancamento(l), 0);
}

export function calcularTotalMes(data: string, todosLancamentos: Lancamento[]): number {
  const prefixoMes = data.slice(0, 7); // YYYY-MM
  return todosLancamentos
    .filter((l) => l.data.startsWith(prefixoMes))
    .reduce((soma, l) => soma + valorLancamento(l), 0);
}

export interface TotaisPeriodo {
  data_inicio: string;
  data_fim: string;
  total_geral: number;
  total_por_canal: TotaisPorCanal;
  vendas_periodo_por_forma_pagamento: TotaisPorFormaPagamento;
  quitados_periodo_por_forma_pagamento: TotaisPorFormaPagamento;
  total_por_forma_pagamento: TotaisPorFormaPagamento;
  fiado_gerado_periodo: number;
  fiado_aberto_periodo: number;
  quitado_periodo: number;
}

export function calcularTotaisPeriodo(
  dataInicio: string,
  dataFim: string,
  todosLancamentos: Lancamento[],
): TotaisPeriodo {
  const doPeriodo = todosLancamentos.filter((l) => l.data >= dataInicio && l.data <= dataFim);
  const quitadosNoPeriodo = todosLancamentos.filter(
    (l) => l.quitado_em !== null && l.quitado_em >= dataInicio && l.quitado_em <= dataFim,
  );

  const total_por_canal = totaisCanalVazio();
  const vendas_periodo_por_forma_pagamento = totaisFormaPagamentoVazio();
  let total_geral = 0;
  let fiado_gerado_periodo = 0;
  let fiado_aberto_periodo = 0;

  for (const l of doPeriodo) {
    const valor = valorLancamento(l);
    total_geral += valor;
    somarPorCanal(total_por_canal, l.canal, valor);
    if (l.forma_pagamento) somarPorForma(vendas_periodo_por_forma_pagamento, l.forma_pagamento, valor);
    if (l.canal === "fiado") {
      fiado_gerado_periodo += valor;
      if (!l.quitado) fiado_aberto_periodo += valor;
    }
  }

  const quitados_periodo_por_forma_pagamento = totaisFormaPagamentoVazio();
  let quitado_periodo = 0;
  for (const l of quitadosNoPeriodo) {
    const valor = valorLancamento(l);
    quitado_periodo += valor;
    if (l.forma_pagamento_quitacao) {
      somarPorForma(quitados_periodo_por_forma_pagamento, l.forma_pagamento_quitacao, valor);
    }
  }

  const total_por_forma_pagamento: TotaisPorFormaPagamento = {
    dinheiro: vendas_periodo_por_forma_pagamento.dinheiro + quitados_periodo_por_forma_pagamento.dinheiro,
    pix: vendas_periodo_por_forma_pagamento.pix + quitados_periodo_por_forma_pagamento.pix,
    cartao: vendas_periodo_por_forma_pagamento.cartao + quitados_periodo_por_forma_pagamento.cartao,
  };

  return {
    data_inicio: dataInicio,
    data_fim: dataFim,
    total_geral,
    total_por_canal,
    vendas_periodo_por_forma_pagamento,
    quitados_periodo_por_forma_pagamento,
    total_por_forma_pagamento,
    fiado_gerado_periodo,
    fiado_aberto_periodo,
    quitado_periodo,
  };
}

export interface ItemResumoEmpresa {
  item_id: string;
  quantidade: number;
  total: number;
}

export interface TotalEmpresaPeriodo {
  empresa_nome: string;
  total: number;
  lancamentos: Lancamento[];
  por_item: ItemResumoEmpresa[];
}

export function calcularTotaisPorEmpresa(
  todosLancamentos: Lancamento[],
  dataInicio: string,
  dataFim: string,
): TotalEmpresaPeriodo[] {
  const doPeriodo = todosLancamentos.filter(
    (l) => l.canal === "empresa" && l.empresa_nome && l.data >= dataInicio && l.data <= dataFim,
  );

  const porEmpresa = new Map<string, Lancamento[]>();
  for (const l of doPeriodo) {
    const nome = l.empresa_nome as string;
    const lista = porEmpresa.get(nome) ?? [];
    lista.push(l);
    porEmpresa.set(nome, lista);
  }

  return Array.from(porEmpresa.entries())
    .map(([empresa_nome, lancamentos]) => {
      let total = 0;
      const porItem = new Map<string, ItemResumoEmpresa>();
      for (const l of lancamentos) {
        const valor = valorLancamento(l);
        total += valor;
        const atual = porItem.get(l.item_id) ?? { item_id: l.item_id, quantidade: 0, total: 0 };
        atual.quantidade += l.quantidade;
        atual.total += valor;
        porItem.set(l.item_id, atual);
      }
      const por_item = Array.from(porItem.values()).sort((a, b) => b.total - a.total);
      return { empresa_nome, total, lancamentos, por_item };
    })
    .sort((a, b) => b.total - a.total);
}

export interface SaldoEmpresa {
  empresa_nome: string;
  saldo: number;
  lancamentos: Lancamento[];
}

export function calcularSaldosEmpresas(todosLancamentos: Lancamento[]): SaldoEmpresa[] {
  const abertos = todosLancamentos.filter((l) => l.canal === "empresa" && l.empresa_nome && !l.quitado);

  const porEmpresa = new Map<string, Lancamento[]>();
  for (const l of abertos) {
    const nome = l.empresa_nome as string;
    const lista = porEmpresa.get(nome) ?? [];
    lista.push(l);
    porEmpresa.set(nome, lista);
  }

  return Array.from(porEmpresa.entries())
    .map(([empresa_nome, lancamentos]) => ({
      empresa_nome,
      saldo: lancamentos.reduce((soma, l) => soma + valorLancamento(l), 0),
      lancamentos,
    }))
    .sort((a, b) => b.saldo - a.saldo);
}
