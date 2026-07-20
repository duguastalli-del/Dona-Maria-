import { useMemo, useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { NOMES_CATEGORIA } from "../lib/itens";
import type { Categoria, Item, Lancamento } from "../lib/types";
import SeletorData from "../components/SeletorData";
import ModalLancamento from "../components/ModalLancamento";
import { formatarMoeda } from "../lib/format";
import { valorLancamento } from "../lib/calculos";
import { ROTULO_CANAL, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";

const CATEGORIAS: Categoria[] = ["prato", "bebida", "doce"];

export default function Lancamentos({ data, onMudarData }: { data: string; onMudarData: (data: string) => void }) {
  const { itens, lancamentos, criarLancamento, editarLancamento, excluirLancamento, diaStatus } = useDados();
  const [itemAtivo, setItemAtivo] = useState<Item | null>(null);
  const [lancamentoEditando, setLancamentoEditando] = useState<Lancamento | null>(null);

  const status = diaStatus(data);
  const lancamentosDoDia = useMemo(
    () => lancamentos.filter((l) => l.data === data).sort((a, b) => b.criado_em.localeCompare(a.criado_em)),
    [lancamentos, data],
  );

  function abrirNovo(item: Item) {
    setLancamentoEditando(null);
    setItemAtivo(item);
  }

  function abrirEdicao(l: Lancamento) {
    const item = itens.find((i) => i.id === l.item_id);
    if (!item) return;
    setLancamentoEditando(l);
    setItemAtivo(item);
  }

  function fecharModal() {
    setItemAtivo(null);
    setLancamentoEditando(null);
  }

  function salvar(entrada: Omit<Lancamento, "id" | "criado_em">) {
    if (lancamentoEditando) {
      editarLancamento(lancamentoEditando.id, entrada);
    } else {
      criarLancamento(entrada);
    }
    fecharModal();
  }

  function excluir(l: Lancamento) {
    if (confirm(`Remover o lançamento de ${itens.find((i) => i.id === l.item_id)?.nome}?`)) {
      excluirLancamento(l.id);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <SeletorData data={data} onMudar={onMudarData} />

      {status.fechado && (
        <div className="flex items-center gap-2 bg-aviso/10 border border-aviso/30 rounded-2xl px-4 py-3 text-aviso">
          <Lock size={16} />
          <span className="text-sm font-semibold">Dia fechado — lançamentos travados. Reabra na aba Fechamento.</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {CATEGORIAS.map((categoria) => (
          <div key={categoria} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-apoio uppercase tracking-wide px-1">{NOMES_CATEGORIA[categoria]}</h3>
            <div className="bg-white rounded-2xl border border-linha divide-y divide-linha">
              {itens
                .filter((i) => i.categoria === categoria)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-tinta">{item.nome}</p>
                      <p className="text-xs text-apoio">{formatarMoeda(item.valor_unitario_padrao)}</p>
                    </div>
                    <button
                      onClick={() => abrirNovo(item)}
                      disabled={status.fechado}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-marca text-white disabled:opacity-30"
                      aria-label={`Lançar ${item.nome}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-apoio uppercase tracking-wide px-1">
          Lançamentos do dia ({lancamentosDoDia.length})
        </h3>
        {lancamentosDoDia.length === 0 ? (
          <p className="text-sm text-apoio px-1">Nenhum lançamento ainda.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-linha divide-y divide-linha">
            {lancamentosDoDia.map((l) => {
              const item = itens.find((i) => i.id === l.item_id);
              return (
                <div key={l.id} className="flex items-center justify-between px-4 py-3 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-tinta truncate">
                      {l.quantidade}x {item?.nome ?? "Item"}
                    </p>
                    <p className="text-xs text-apoio">
                      {ROTULO_CANAL[l.canal]}
                      {l.canal === "fiado"
                        ? ` · ${l.fiado_cliente}${l.fiado_quitado ? " · quitado" : " · em aberto"}`
                        : ` · ${ROTULO_FORMA_PAGAMENTO[l.forma_pagamento!]}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-tinta">{formatarMoeda(valorLancamento(l))}</span>
                    <button
                      onClick={() => abrirEdicao(l)}
                      disabled={status.fechado}
                      className="p-1.5 text-apoio disabled:opacity-30"
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => excluir(l)}
                      disabled={status.fechado}
                      className="p-1.5 text-erro disabled:opacity-30"
                      aria-label="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {itemAtivo && (
        <ModalLancamento
          item={itemAtivo}
          data={data}
          lancamentoExistente={lancamentoEditando ?? undefined}
          onFechar={fecharModal}
          onSalvar={salvar}
        />
      )}
    </div>
  );
}
