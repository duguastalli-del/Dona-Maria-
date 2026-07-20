import { useMemo, useState } from "react";
import { Lock, Pencil, Trash2 } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { NOMES_CATEGORIA } from "../lib/itens";
import type { Categoria, Item, Lancamento } from "../lib/types";
import SeletorData from "../components/SeletorData";
import ModalLancamento from "../components/ModalLancamento";
import LinhaItemRapido from "../components/LinhaItemRapido";
import { formatarMoeda } from "../lib/format";
import { calcularTotalMes, valorLancamento } from "../lib/calculos";
import { ROTULO_CANAL, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";

const CATEGORIAS: Categoria[] = ["prato", "bebida", "doce"];

export default function Lancamentos({ data, onMudarData }: { data: string; onMudarData: (data: string) => void }) {
  const { itens, lancamentos, criarLancamento, editarLancamento, excluirLancamento, diaStatus } = useDados();
  const [itemAtivo, setItemAtivo] = useState<Item | null>(null);
  const [lancamentoEditando, setLancamentoEditando] = useState<Lancamento | null>(null);
  const [quantidadePreenchida, setQuantidadePreenchida] = useState(1);
  const [versaoLinha, setVersaoLinha] = useState<Record<string, number>>({});

  const status = diaStatus(data);
  const lancamentosDoDia = useMemo(
    () => lancamentos.filter((l) => l.data === data).sort((a, b) => b.criado_em.localeCompare(a.criado_em)),
    [lancamentos, data],
  );

  const totalHoje = useMemo(() => lancamentosDoDia.reduce((soma, l) => soma + valorLancamento(l), 0), [lancamentosDoDia]);
  const totalMes = useMemo(() => calcularTotalMes(data, lancamentos), [data, lancamentos]);

  function lancarRapido(item: Item, quantidade: number) {
    criarLancamento({
      data,
      item_id: item.id,
      quantidade,
      valor_unitario: item.valor_unitario_padrao,
      canal: "salao",
      forma_pagamento: "dinheiro",
      fiado_cliente: null,
      fiado_quitado: false,
      fiado_quitado_em: null,
      fiado_forma_pagamento: null,
      empresa_nome: null,
    });
  }

  function abrirMaisOpcoes(item: Item, quantidadeAtual: number) {
    setLancamentoEditando(null);
    setQuantidadePreenchida(quantidadeAtual > 0 ? quantidadeAtual : 1);
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
      setVersaoLinha((atual) => ({ ...atual, [entrada.item_id]: (atual[entrada.item_id] ?? 0) + 1 }));
    }
    fecharModal();
  }

  function excluir(l: Lancamento) {
    if (confirm(`Remover o lançamento de ${itens.find((i) => i.id === l.item_id)?.nome}?`)) {
      excluirLancamento(l.id);
    }
  }

  function rotuloCanalLinha(l: Lancamento): string {
    if (l.canal === "fiado") return `${l.fiado_cliente}${l.fiado_quitado ? " · quitado" : " · em aberto"}`;
    if (l.canal === "empresa") return `${l.empresa_nome} · ${ROTULO_FORMA_PAGAMENTO[l.forma_pagamento!]}`;
    return ROTULO_FORMA_PAGAMENTO[l.forma_pagamento!];
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <SeletorData data={data} onMudar={onMudarData} />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-marca rounded-2xl px-4 py-3 text-white">
          <p className="text-xs font-semibold opacity-90">Total hoje</p>
          <p className="text-lg font-bold">{formatarMoeda(totalHoje)}</p>
        </div>
        <div className="bg-white rounded-2xl px-4 py-3 border border-linha">
          <p className="text-xs font-semibold text-apoio">Total do mês</p>
          <p className="text-lg font-bold text-tinta">{formatarMoeda(totalMes)}</p>
        </div>
      </div>

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
                  <LinhaItemRapido
                    key={`${item.id}:${versaoLinha[item.id] ?? 0}`}
                    item={item}
                    disabled={status.fechado}
                    onLancarRapido={lancarRapido}
                    onMaisOpcoes={abrirMaisOpcoes}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-apoio px-1 -mt-2">
        Digite a quantidade e toque em ✓ pra lançar rápido (Salão/Dinheiro). Use "⋯" pra iFood, 99Food, Empresa ou
        Fiado.
      </p>

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
                    <p className="text-xs text-apoio truncate">
                      {ROTULO_CANAL[l.canal]} · {rotuloCanalLinha(l)}
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
          quantidadeInicial={quantidadePreenchida}
          onFechar={fecharModal}
          onSalvar={salvar}
        />
      )}
    </div>
  );
}
