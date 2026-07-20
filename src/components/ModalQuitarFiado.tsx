import { useState } from "react";
import { X } from "lucide-react";
import type { FormaPagamento, Item, Lancamento } from "../lib/types";
import { FORMAS_PAGAMENTO, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";
import { formatarMoeda, hojeISO } from "../lib/format";
import { valorLancamento } from "../lib/calculos";

interface Props {
  lancamento: Lancamento;
  item: Item | undefined;
  onFechar: () => void;
  onConfirmar: (forma: FormaPagamento, dataQuitacao: string) => void;
}

export default function ModalQuitarFiado({ lancamento, item, onFechar, onConfirmar }: Props) {
  const [forma, setForma] = useState<FormaPagamento>("dinheiro");
  const dataQuitacao = hojeISO();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onFechar}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">Quitar fiado</h2>
          <button onClick={onFechar} className="p-1 text-apoio" aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <div className="bg-fundo rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-tinta">{lancamento.fiado_cliente}</p>
          <p className="text-xs text-apoio">
            {lancamento.quantidade}x {item?.nome ?? "Item"} · vendido em {lancamento.data}
          </p>
          <p className="text-lg font-bold text-tinta mt-1">{formatarMoeda(valorLancamento(lancamento))}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-tinta block">Forma de pagamento</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMAS_PAGAMENTO.map((f) => (
              <button
                key={f}
                onClick={() => setForma(f)}
                className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
                  forma === f ? "bg-marca text-white border-marca" : "bg-white text-tinta border-linha"
                }`}
              >
                {ROTULO_FORMA_PAGAMENTO[f]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-apoio">Será registrado como quitado hoje ({dataQuitacao}).</p>

        <button
          onClick={() => onConfirmar(forma, dataQuitacao)}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-marca"
        >
          Confirmar quitação
        </button>
      </div>
    </div>
  );
}
