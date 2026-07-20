import { useState } from "react";
import { Check } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { NOMES_CATEGORIA } from "../lib/itens";
import type { Categoria } from "../lib/types";

const CATEGORIAS: Categoria[] = ["prato", "bebida", "doce"];

interface Rascunho {
  nome: string;
  valor_unitario_padrao: string;
}

export default function Cardapio() {
  const { itens, editarItem } = useDados();
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({});

  function valorAtual(itemId: string, campo: keyof Rascunho, original: string): string {
    return rascunhos[itemId]?.[campo] ?? original;
  }

  function alterar(itemId: string, campo: keyof Rascunho, valor: string, original: Rascunho) {
    setRascunhos((atual) => ({
      ...atual,
      [itemId]: { ...original, ...atual[itemId], [campo]: valor },
    }));
  }

  function salvar(itemId: string) {
    const rascunho = rascunhos[itemId];
    if (!rascunho) return;
    const nome = rascunho.nome.trim();
    const preco = Number(rascunho.valor_unitario_padrao.replace(",", "."));
    if (!nome || Number.isNaN(preco) || preco < 0) return;
    editarItem(itemId, { nome, valor_unitario_padrao: preco });
    setRascunhos((atual) => {
      const novo = { ...atual };
      delete novo[itemId];
      return novo;
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <p className="text-sm text-apoio px-1">
        Edite o nome e o preço-padrão de cada item. A alteração vale para os próximos lançamentos.
      </p>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
        {CATEGORIAS.map((categoria) => (
          <div key={categoria} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-apoio uppercase tracking-wide px-1">{NOMES_CATEGORIA[categoria]}</h3>
            <div className="bg-white rounded-2xl border border-linha divide-y divide-linha">
              {itens
                .filter((i) => i.categoria === categoria)
                .map((item) => {
                  const nome = valorAtual(item.id, "nome", item.nome);
                  const preco = valorAtual(item.id, "valor_unitario_padrao", String(item.valor_unitario_padrao));
                  const alterado = !!rascunhos[item.id];
                  return (
                    <div key={item.id} className="flex items-center gap-2 px-4 py-3">
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) =>
                          alterar(item.id, "nome", e.target.value, { nome: item.nome, valor_unitario_padrao: preco })
                        }
                        className="flex-1 min-w-0 rounded-lg px-2.5 py-2 text-sm outline-none bg-fundo border border-linha"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm text-apoio">R$</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          inputMode="decimal"
                          value={preco}
                          onChange={(e) =>
                            alterar(item.id, "valor_unitario_padrao", e.target.value, { nome, valor_unitario_padrao: preco })
                          }
                          className="w-20 rounded-lg px-2 py-2 text-sm outline-none bg-fundo border border-linha"
                        />
                      </div>
                      <button
                        onClick={() => salvar(item.id)}
                        disabled={!alterado}
                        className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-marca text-white disabled:opacity-20"
                        aria-label={`Salvar ${item.nome}`}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
