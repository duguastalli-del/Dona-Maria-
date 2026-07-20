import { useMemo, useState } from "react";
import { Lock, Trash2, X } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { NOMES_CATEGORIA } from "../lib/itens";
import type { Categoria, Item } from "../lib/types";
import { formatarMoeda, hojeISO } from "../lib/format";
import { valorLancamento } from "../lib/calculos";
import LinhaItemRapido from "./LinhaItemRapido";
import SeletorData from "./SeletorData";

const CATEGORIAS: Categoria[] = ["prato", "bebida", "doce"];

interface Props {
  empresaNome: string;
  onFechar: () => void;
}

export default function ModalVendaEmpresa({ empresaNome, onFechar }: Props) {
  const { itens, lancamentos, criarLancamento, excluirLancamento, diaStatus } = useDados();
  const [data, setData] = useState(hojeISO());
  const [versaoLinha, setVersaoLinha] = useState<Record<string, number>>({});

  const status = diaStatus(data);

  const lancamentosDoDia = useMemo(
    () =>
      lancamentos
        .filter((l) => l.canal === "empresa" && l.empresa_nome === empresaNome && l.data === data)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em)),
    [lancamentos, empresaNome, data],
  );

  const totalDia = useMemo(
    () => lancamentosDoDia.reduce((soma, l) => soma + valorLancamento(l), 0),
    [lancamentosDoDia],
  );

  function lancarRapido(item: Item, quantidade: number) {
    criarLancamento({
      data,
      item_id: item.id,
      quantidade,
      valor_unitario: item.valor_unitario_padrao,
      canal: "empresa",
      forma_pagamento: null,
      fiado_cliente: null,
      empresa_nome: empresaNome,
      quitado: false,
      quitado_em: null,
      forma_pagamento_quitacao: null,
    });
    setVersaoLinha((atual) => ({ ...atual, [item.id]: (atual[item.id] ?? 0) + 1 }));
  }

  function excluir(id: string, nome: string) {
    if (confirm(`Remover ${nome} do pedido de ${empresaNome}?`)) {
      excluirLancamento(id);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onFechar}>
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-tinta">{empresaNome}</h2>
            <p className="text-xs text-apoio">Lançar venda</p>
          </div>
          <button onClick={onFechar} className="p-1 text-apoio" aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <SeletorData data={data} onMudar={setData} />

        {status.fechado && (
          <div className="flex items-center gap-2 bg-aviso/10 border border-aviso/30 rounded-2xl px-4 py-3 text-aviso">
            <Lock size={16} />
            <span className="text-sm font-semibold">Esse dia está fechado — reabra na aba Fechamento pra lançar.</span>
          </div>
        )}

        <div className="bg-marca rounded-2xl px-4 py-3 text-white flex items-center justify-between">
          <span className="text-sm font-semibold opacity-90">Total do dia</span>
          <span className="text-xl font-bold">{formatarMoeda(totalDia)}</span>
        </div>

        <div className="flex flex-col gap-4">
          {CATEGORIAS.map((categoria) => (
            <div key={categoria} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-apoio uppercase tracking-wide px-1">
                {NOMES_CATEGORIA[categoria]}
              </h3>
              <div className="bg-white rounded-2xl border border-linha divide-y divide-linha">
                {itens
                  .filter((i) => i.categoria === categoria)
                  .map((item) => (
                    <LinhaItemRapido
                      key={`${item.id}:${versaoLinha[item.id] ?? 0}`}
                      item={item}
                      disabled={status.fechado}
                      onLancarRapido={lancarRapido}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {lancamentosDoDia.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-apoio uppercase tracking-wide px-1">
              Lançado nesse dia ({lancamentosDoDia.length})
            </h3>
            <div className="bg-white rounded-2xl border border-linha divide-y divide-linha">
              {lancamentosDoDia.map((l) => {
                const item = itens.find((i) => i.id === l.item_id);
                return (
                  <div key={l.id} className="flex items-center justify-between px-4 py-3 gap-2">
                    <span className="text-sm text-tinta">
                      {l.quantidade}x {item?.nome ?? "Item"}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-tinta">{formatarMoeda(valorLancamento(l))}</span>
                      <button
                        onClick={() => excluir(l.id, item?.nome ?? "item")}
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
          </div>
        )}

        <button onClick={onFechar} className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-marca">
          Concluir
        </button>
      </div>
    </div>
  );
}
