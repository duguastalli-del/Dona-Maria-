import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { DiaStatus, Empresa, FormaPagamento, Item, Lancamento } from "../lib/types";
import {
  adicionarEmpresa,
  adicionarLancamento,
  atualizarItem,
  atualizarLancamento,
  definirStatusEmpresa,
  fecharDia,
  garantirDadosIniciais,
  getDias,
  getEmpresas,
  getItens,
  getLancamentos,
  reabrirDia,
  reabrirFiado,
  removerLancamento,
  quitarFiado,
} from "../lib/storage";

garantirDadosIniciais();

interface DadosContextValor {
  itens: Item[];
  lancamentos: Lancamento[];
  dias: DiaStatus[];
  empresas: Empresa[];
  editarItem: (id: string, alteracoes: Partial<Pick<Item, "nome" | "valor_unitario_padrao">>) => void;
  criarEmpresa: (nome: string) => void;
  definirStatusEmpresaPor: (id: string, ativa: boolean) => void;
  criarLancamento: (entrada: Omit<Lancamento, "id" | "criado_em">) => void;
  editarLancamento: (id: string, alteracoes: Partial<Lancamento>) => void;
  excluirLancamento: (id: string) => void;
  quitarFiadoPor: (id: string, forma: FormaPagamento, dataQuitacao: string) => void;
  reabrirFiadoPor: (id: string) => void;
  fecharDiaPor: (data: string, dinheiroContado: number) => void;
  reabrirDiaPor: (data: string) => void;
  diaStatus: (data: string) => DiaStatus;
}

const DadosContext = createContext<DadosContextValor | null>(null);

export function DadosProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Item[]>(() => getItens());
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => getLancamentos());
  const [dias, setDias] = useState<DiaStatus[]>(() => getDias());
  const [empresas, setEmpresas] = useState<Empresa[]>(() => getEmpresas());

  const recarregar = useCallback(() => {
    setLancamentos(getLancamentos());
    setDias(getDias());
  }, []);

  const editarItem = useCallback((id: string, alteracoes: Partial<Pick<Item, "nome" | "valor_unitario_padrao">>) => {
    atualizarItem(id, alteracoes);
    setItens(getItens());
  }, []);

  const criarEmpresa = useCallback((nome: string) => {
    adicionarEmpresa(nome);
    setEmpresas(getEmpresas());
  }, []);

  const definirStatusEmpresaPor = useCallback((id: string, ativa: boolean) => {
    definirStatusEmpresa(id, ativa);
    setEmpresas(getEmpresas());
  }, []);

  const criarLancamento = useCallback(
    (entrada: Omit<Lancamento, "id" | "criado_em">) => {
      adicionarLancamento(entrada);
      recarregar();
    },
    [recarregar],
  );

  const editarLancamento = useCallback(
    (id: string, alteracoes: Partial<Lancamento>) => {
      atualizarLancamento(id, alteracoes);
      recarregar();
    },
    [recarregar],
  );

  const excluirLancamento = useCallback(
    (id: string) => {
      removerLancamento(id);
      recarregar();
    },
    [recarregar],
  );

  const quitarFiadoPor = useCallback(
    (id: string, forma: FormaPagamento, dataQuitacao: string) => {
      quitarFiado(id, forma, dataQuitacao);
      recarregar();
    },
    [recarregar],
  );

  const reabrirFiadoPor = useCallback(
    (id: string) => {
      reabrirFiado(id);
      recarregar();
    },
    [recarregar],
  );

  const fecharDiaPor = useCallback(
    (data: string, dinheiroContado: number) => {
      fecharDia(data, dinheiroContado);
      recarregar();
    },
    [recarregar],
  );

  const reabrirDiaPor = useCallback(
    (data: string) => {
      reabrirDia(data);
      recarregar();
    },
    [recarregar],
  );

  const diaStatus = useCallback(
    (data: string): DiaStatus => dias.find((d) => d.data === data) ?? { data, fechado: false, dinheiro_contado: null, fechado_em: null },
    [dias],
  );

  const valor = useMemo<DadosContextValor>(
    () => ({
      itens,
      lancamentos,
      dias,
      empresas,
      editarItem,
      criarEmpresa,
      definirStatusEmpresaPor,
      criarLancamento,
      editarLancamento,
      excluirLancamento,
      quitarFiadoPor,
      reabrirFiadoPor,
      fecharDiaPor,
      reabrirDiaPor,
      diaStatus,
    }),
    [
      itens,
      lancamentos,
      dias,
      empresas,
      editarItem,
      criarEmpresa,
      definirStatusEmpresaPor,
      criarLancamento,
      editarLancamento,
      excluirLancamento,
      quitarFiadoPor,
      reabrirFiadoPor,
      fecharDiaPor,
      reabrirDiaPor,
      diaStatus,
    ],
  );

  return <DadosContext.Provider value={valor}>{children}</DadosContext.Provider>;
}

export function useDados(): DadosContextValor {
  const ctx = useContext(DadosContext);
  if (!ctx) throw new Error("useDados precisa estar dentro de <DadosProvider>");
  return ctx;
}
