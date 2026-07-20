import { useState } from "react";
import { X } from "lucide-react";
import type { Canal, FormaPagamento, Item, Lancamento } from "../lib/types";
import { CANAIS, FORMAS_PAGAMENTO, ROTULO_CANAL, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";
import { formatarMoeda } from "../lib/format";

interface Props {
  item: Item;
  data: string;
  lancamentoExistente?: Lancamento;
  quantidadeInicial?: number;
  onFechar: () => void;
  onSalvar: (entrada: Omit<Lancamento, "id" | "criado_em">) => void;
}

export default function ModalLancamento({
  item,
  data,
  lancamentoExistente,
  quantidadeInicial,
  onFechar,
  onSalvar,
}: Props) {
  const [quantidade, setQuantidade] = useState(lancamentoExistente?.quantidade ?? quantidadeInicial ?? 1);
  const [valorUnitario, setValorUnitario] = useState(
    lancamentoExistente?.valor_unitario ?? item.valor_unitario_padrao,
  );
  const [canal, setCanal] = useState<Canal>(lancamentoExistente?.canal ?? "salao");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(
    lancamentoExistente?.forma_pagamento ?? "dinheiro",
  );
  const [fiadoCliente, setFiadoCliente] = useState(lancamentoExistente?.fiado_cliente ?? "");
  const [empresaNome, setEmpresaNome] = useState(lancamentoExistente?.empresa_nome ?? "");
  const [erro, setErro] = useState("");

  const isFiado = canal === "fiado";
  const isEmpresa = canal === "empresa";
  const total = quantidade * valorUnitario;

  function salvar() {
    if (quantidade <= 0) {
      setErro("Quantidade precisa ser maior que zero.");
      return;
    }
    if (valorUnitario < 0) {
      setErro("Valor unitário não pode ser negativo.");
      return;
    }
    if (isFiado && !fiadoCliente.trim()) {
      setErro("Informe o nome do cliente fiado.");
      return;
    }
    if (isEmpresa && !empresaNome.trim()) {
      setErro("Informe o nome da empresa.");
      return;
    }

    onSalvar({
      data,
      item_id: item.id,
      quantidade,
      valor_unitario: valorUnitario,
      canal,
      forma_pagamento: isFiado ? null : formaPagamento,
      fiado_cliente: isFiado ? fiadoCliente.trim() : null,
      fiado_quitado: lancamentoExistente?.fiado_quitado ?? false,
      fiado_quitado_em: lancamentoExistente?.fiado_quitado_em ?? null,
      fiado_forma_pagamento: lancamentoExistente?.fiado_forma_pagamento ?? null,
      empresa_nome: isEmpresa ? empresaNome.trim() : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onFechar}>
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">{item.nome}</h2>
          <button onClick={onFechar} className="p-1 text-apoio" aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Quantidade</label>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl px-3 py-3 text-base outline-none bg-fundo border border-linha"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Valor unitário (R$)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl px-3 py-3 text-base outline-none bg-fundo border border-linha"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-tinta block">Canal de venda</label>
          <div className="grid grid-cols-3 gap-2">
            {CANAIS.map((c) => (
              <button
                key={c}
                onClick={() => setCanal(c)}
                className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
                  canal === c ? "bg-marca text-white border-marca" : "bg-white text-tinta border-linha"
                }`}
              >
                {ROTULO_CANAL[c]}
              </button>
            ))}
          </div>
        </div>

        {isEmpresa && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Nome da empresa</label>
            <input
              type="text"
              value={empresaNome}
              onChange={(e) => setEmpresaNome(e.target.value)}
              placeholder="Ex: Transportes ABC"
              className="w-full rounded-xl px-3 py-3 text-base outline-none bg-fundo border border-linha"
            />
          </div>
        )}

        {isFiado ? (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Nome do cliente (fiado)</label>
            <input
              type="text"
              value={fiadoCliente}
              onChange={(e) => setFiadoCliente(e.target.value)}
              placeholder="Ex: Seu Antônio"
              className="w-full rounded-xl px-3 py-3 text-base outline-none bg-fundo border border-linha"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Forma de pagamento</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAS_PAGAMENTO.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormaPagamento(f)}
                  className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${
                    formaPagamento === f ? "bg-marca text-white border-marca" : "bg-white text-tinta border-linha"
                  }`}
                >
                  {ROTULO_FORMA_PAGAMENTO[f]}
                </button>
              ))}
            </div>
          </div>
        )}

        {erro && <p className="text-sm text-erro">{erro}</p>}

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-apoio">Total</span>
          <span className="text-xl font-bold text-tinta">{formatarMoeda(total)}</span>
        </div>

        <button onClick={salvar} className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-marca">
          {lancamentoExistente ? "Salvar alterações" : "Adicionar lançamento"}
        </button>
      </div>
    </div>
  );
}
