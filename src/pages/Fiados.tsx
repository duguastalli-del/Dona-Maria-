import { useMemo, useState } from "react";
import { useDados } from "../contexts/DadosContext";
import type { Lancamento } from "../lib/types";
import { calcularFiadoAbertoTotal, valorLancamento } from "../lib/calculos";
import { formatarDataCurta, formatarMoeda } from "../lib/format";
import ModalQuitarFiado from "../components/ModalQuitarFiado";

export default function Fiados() {
  const { itens, lancamentos, quitarFiadoPor } = useDados();
  const [quitando, setQuitando] = useState<Lancamento | null>(null);

  const fiadosAbertos = useMemo(
    () =>
      lancamentos
        .filter((l) => l.canal === "fiado" && !l.fiado_quitado)
        .sort((a, b) => a.data.localeCompare(b.data)),
    [lancamentos],
  );

  const totalAberto = useMemo(() => calcularFiadoAbertoTotal(lancamentos), [lancamentos]);

  function confirmarQuitacao(forma: Parameters<typeof quitarFiadoPor>[1], dataQuitacao: string) {
    if (!quitando) return;
    quitarFiadoPor(quitando.id, forma, dataQuitacao);
    setQuitando(null);
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="bg-marca rounded-2xl px-4 py-4 text-white flex items-center justify-between">
        <span className="text-sm font-semibold opacity-90">Total em fiado aberto</span>
        <span className="text-2xl font-bold">{formatarMoeda(totalAberto)}</span>
      </div>

      {fiadosAbertos.length === 0 ? (
        <p className="text-sm text-apoio px-1">Nenhum fiado em aberto. 🎉</p>
      ) : (
        <div className="bg-white rounded-2xl border border-linha divide-y divide-linha">
          {fiadosAbertos.map((l) => {
            const item = itens.find((i) => i.id === l.item_id);
            return (
              <div key={l.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-tinta truncate">{l.fiado_cliente}</p>
                  <p className="text-xs text-apoio">
                    {l.quantidade}x {item?.nome ?? "Item"} · {formatarDataCurta(l.data)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-tinta">{formatarMoeda(valorLancamento(l))}</span>
                  <button
                    onClick={() => setQuitando(l)}
                    className="rounded-lg px-3 py-2 text-xs font-bold text-white bg-marca"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {quitando && (
        <ModalQuitarFiado
          lancamento={quitando}
          item={itens.find((i) => i.id === quitando.item_id)}
          onFechar={() => setQuitando(null)}
          onConfirmar={confirmarQuitacao}
        />
      )}
    </div>
  );
}
