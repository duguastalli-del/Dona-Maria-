import type { Categoria, DiaStatus, Empresa, FormaPagamento, Item, Lancamento } from "./types";
import { ITENS_PADRAO } from "./itens";
import { criarLancamentosExemplo, diaAnteontemExemplo, EMPRESAS_EXEMPLO } from "./exemplo";

const CHAVES = {
  itens: "dm:itens",
  lancamentos: "dm:lancamentos",
  dias: "dm:dias",
  empresas: "dm:empresas",
  seed: "dm:seed_v1",
  seedEmpresas: "dm:seed_empresas_v1",
  backup: "dm:backup_apagados",
} as const;

export interface BackupApagados {
  lancamentos: Lancamento[];
  dias: DiaStatus[];
  em: string; // ISO timestamp
}

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
      troco_inicial: null,
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

export function adicionarItem(nome: string, categoria: Categoria, valorUnitarioPadrao: number): Item {
  const item: Item = { id: crypto.randomUUID(), nome, categoria, valor_unitario_padrao: valorUnitarioPadrao };
  const itens = getItens();
  itens.push(item);
  gravar(CHAVES.itens, itens);
  return item;
}

export function removerItem(id: string): void {
  gravar(CHAVES.itens, getItens().filter((i) => i.id !== id));
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

export function apagarTodosLancamentos(): void {
  const backup: BackupApagados = {
    lancamentos: getLancamentos(),
    dias: getDias(),
    em: new Date().toISOString(),
  };
  gravar(CHAVES.backup, backup);
  salvarLancamentos([]);
  salvarDias([]);
}

export function getBackupApagados(): BackupApagados | null {
  return ler(CHAVES.backup, null as BackupApagados | null);
}

export function restaurarBackupApagados(): void {
  const backup = getBackupApagados();
  if (!backup) return;
  salvarLancamentos(backup.lancamentos);
  salvarDias(backup.dias);
  localStorage.removeItem(CHAVES.backup);
}

export function descartarBackupApagados(): void {
  localStorage.removeItem(CHAVES.backup);
}

export function quitarLancamento(id: string, formaPagamento: FormaPagamento, dataQuitacao: string): void {
  atualizarLancamento(id, {
    quitado: true,
    quitado_em: dataQuitacao,
    forma_pagamento_quitacao: formaPagamento,
  });
}

export function reabrirQuitacao(id: string): void {
  atualizarLancamento(id, {
    quitado: false,
    quitado_em: null,
    forma_pagamento_quitacao: null,
  });
}

export function quitarContaEmpresa(empresaNome: string, formaPagamento: FormaPagamento, dataQuitacao: string): void {
  const lancamentos = getLancamentos().map((l) =>
    l.canal === "empresa" && l.empresa_nome === empresaNome && !l.quitado
      ? { ...l, quitado: true, quitado_em: dataQuitacao, forma_pagamento_quitacao: formaPagamento }
      : l,
  );
  salvarLancamentos(lancamentos);
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
  return existente ?? { data, fechado: false, dinheiro_contado: null, fechado_em: null, troco_inicial: null };
}

function atualizarDia(data: string, alteracoes: Partial<Omit<DiaStatus, "data">>): void {
  const dias = getDias();
  const idx = dias.findIndex((d) => d.data === data);
  if (idx >= 0) {
    dias[idx] = { ...dias[idx], ...alteracoes };
  } else {
    dias.push({ data, fechado: false, dinheiro_contado: null, fechado_em: null, troco_inicial: null, ...alteracoes });
  }
  salvarDias(dias);
}

export function definirTrocoInicial(data: string, valor: number): void {
  atualizarDia(data, { troco_inicial: valor });
}

export function fecharDia(data: string, dinheiroContado: number): void {
  atualizarDia(data, {
    fechado: true,
    dinheiro_contado: dinheiroContado,
    fechado_em: new Date().toISOString(),
  });
}

export function reabrirDia(data: string): void {
  atualizarDia(data, { fechado: false, fechado_em: null });
}
