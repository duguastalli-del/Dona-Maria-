import { useState } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import type { Item } from "../lib/types";
import { formatarMoeda } from "../lib/format";

interface Props {
  item: Item;
  disabled: boolean;
  onLancarRapido: (item: Item, quantidade: number) => void;
  onMaisOpcoes?: (item: Item, quantidadeAtual: number) => void;
}

export default function LinhaItemRapido({ item, disabled, onLancarRapido, onMaisOpcoes }: Props) {
  const [quantidade, setQuantidade] = useState("");
  const qtdNum = Number(quantidade) || 0;

  function confirmar() {
    if (qtdNum <= 0) return;
    onLancarRapido(item, qtdNum);
    setQuantidade("");
  }

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-tinta leading-snug">{item.nome}</p>
        <p className="text-xs text-apoio">
          {formatarMoeda(item.valor_unitario_padrao)}
          {qtdNum > 0 && <span className="font-semibold text-marca"> · = {formatarMoeda(qtdNum * item.valor_unitario_padrao)}</span>}
        </p>
      </div>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        placeholder="Qtd"
        value={quantidade}
        disabled={disabled}
        onChange={(e) => setQuantidade(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirmar();
        }}
        className="w-14 text-center rounded-lg px-1 py-2.5 text-sm outline-none bg-fundo border border-linha disabled:opacity-30"
      />
      <button
        onClick={confirmar}
        disabled={disabled || qtdNum <= 0}
        aria-label={`Lançar ${item.nome} rápido`}
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-marca text-white disabled:opacity-30"
      >
        <Check size={16} />
      </button>
      {onMaisOpcoes && (
        <button
          onClick={() => onMaisOpcoes(item, qtdNum)}
          disabled={disabled}
          aria-label={`Mais opções ${item.nome}`}
          className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-apoio border border-linha disabled:opacity-30"
        >
          <MoreHorizontal size={16} />
        </button>
      )}
    </div>
  );
}
