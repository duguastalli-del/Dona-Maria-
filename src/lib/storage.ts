import type { DiaStatus, Empresa, FormaPagamento, Item, Lancamento } from "./types";
import { ITENS_PADRAO } from "./itens";
import { criarLancamentosExemplo, diaAnteontemExemplo, EMPRESAS_EXEMPLO } from "./exemplo";

const CHAVES = {
  itens: "dm:itens",
  lancamentos: "dm:lancamentos",
  dias: "dm:dias",
  empresas: "dm:empresas",
  seed: "dm:seed_v1",
  seedEmpresas: "dm:seed_empresas_v1",
} as const;

function ler<T>(chave: string, padrao: T): T {
  const bruto = localStorage.getItem(chave);
  if (!bruto) return padrao;
  try {
    return JSON.parse(bruto) as T;
  } catch {
    return padrao;
  }
}

function gravar<T>(chave: string, valor: T): void {
  localStorage.setItem(chave, JSON.stringify(valor));
}

export function garantirDadosIniciais(): void {
  if (!localStorage.getItem(CHAVES.itens)) {
    gravar(CHAVES.itens, ITENS_PADRAO);
  }
  if (!localStorage.getItem(CHAVES.seed)) {
    gravar(CHAVES.lancamentos, criarLancamentosExemplo());
    const diaExemploFechado: DiaStatus = {
      data: diaAnteontemExemplo(),
      fechado: true,
      dinheiro_contado: 305,
      fechado_em: new Date().toISOString(),
    };
    gravar(CHAVES.dias, [diaExemploFechado]);
    localStorage.setItem(CHAVES.seed, "1");
  }
  if (!localStorage.getItem(CHAVES.seedEmpresas)) {
    gravar(CHAVES.empresas, EMPRESAS_EXEMPLO);
    localStorage.setItem(CHAVES.seedEmpresas, "1");
  }
}

export function getItens(): Item[] {
  return ler(CHAVES.itens, ITENS_PADRAO);
}

export function atualizarItem(id: string, alteracoes: Partial<Pick<Item, "nome" | "valor_unitario_padrao">>): void {
  const itens = getItens().map((i) => (i.id === id ? { ...i, ...alteracoes } : i));
  gravar(CHAVES.itens, itens);
}

export function getLancamentos(): Lancamento[] {
  return ler(CHAVES.lancamentos, [] as Lancamento[]);
}

function salvarLancamentos(lancamentos: Lancamento[]): void {
  gravar(CHAVES.lancamentos, lancamentos);
}

export function getLancamentosDoDia(data: string): Lancamento[] {
  return getLancamentos().filter((l) => l.data === data);
}

export function adicionarLancamento(entrada: Omit<Lancamento, "id" | "criado_em">): Lancamento {
  const lancamento: Lancamento = {
    ...entrada,
    id: crypto.randomUUID(),
    criado_em: new Date().toISOString(),
  };
  const lancamentos = getLancamentos();
  lancamentos.push(lancamento);
  salvarLancamentos(lancamentos);
  return lancamento;
}

export function atualizarLancamento(id: string, alteracoes: Partial<Lancamento>): void {
  const lancamentos = getLancamentos().map((l) => (l.id === id ? { ...l, ...alteracoes } : l));
  salvarLancamentos(lancamentos);
}

export function removerLancamento(id: string): void {
  salvarLancamentos(getLancamentos().filter((l) => l.id !== id));
}

export function quitarFiado(id: string, formaPagamento: FormaPagamento, dataQuitacao: string): void {
  atualizarLancamento(id, {
    fiado_quitado: true,
    fiado_quitado_em: dataQuitacao,
    fiado_forma_pagamento: formaPagamento,
  });
}

export function reabrirFiado(id: string): void {
  atualizarLancamento(id, {
    fiado_quitado: false,
    fiado_quitado_em: null,
    fiado_forma_pagamento: null,
  });
}

export function getEmpresas(): Empresa[] {
  return ler(CHAVES.empresas, [] as Empresa[]);
}

function salvarEmpresas(empresas: Empresa[]): void {
  gravar(CHAVES.empresas, empresas);
}

export function adicionarEmpresa(nome: string): Empresa {
  const empresa: Empresa = {
    id: crypto.randomUUID(),
    nome,
    ativa: true,
    criado_em: new Date().toISOString(),
  };
  const empresas = getEmpresas();
  empresas.push(empresa);
  salvarEmpresas(empresas);
  return empresa;
}

export function definirStatusEmpresa(id: string, ativa: boolean): void {
  const empresas = getEmpresas().map((e) => (e.id === id ? { ...e, ativa } : e));
  salvarEmpresas(empresas);
}

export function getDias(): DiaStatus[] {
  return ler(CHAVES.dias, [] as DiaStatus[]);
}

function salvarDias(dias: DiaStatus[]): void {
  gravar(CHAVES.dias, dias);
}

export function getDiaStatus(data: string): DiaStatus {
  const existente = getDias().find((d) => d.data === data);
  return existente ?? { data, fechado: false, dinheiro_contado: null, fechado_em: null };
}

export function fecharDia(data: string, dinheiroContado: number): void {
  const dias = getDias();
  const idx = dias.findIndex((d) => d.data === data);
  const status: DiaStatus = {
    data,
    fechado: true,
    dinheiro_contado: dinheiroContado,
    fechado_em: new Date().toISOString(),
  };
  if (idx >= 0) dias[idx] = status;
  else dias.push(status);
  salvarDias(dias);
}

export function reabrirDia(data: string): void {
  const dias = getDias();
  const idx = dias.findIndex((d) => d.data === data);
  if (idx >= 0) {
    dias[idx] = { ...dias[idx], fechado: false, fechado_em: null };
    salvarDias(dias);
  }
}
