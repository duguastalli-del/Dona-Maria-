import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { calcularTotaisPorEmpresa } from "../lib/calculos";
import { formatarDataCurta, formatarMoeda, hojeISO } from "../lib/format";
import { FORMAS_PAGAMENTO, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";

function primeiroDiaDoMes(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

export default function Empresas() {
  const { lancamentos, itens } = useDados();
  const hoje = hojeISO();
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes(hoje));
  const [dataFim, setDataFim] = useState(hoje);
  const [expandida, setExpandida] = useState<string | null>(null);

  const totais = useMemo(
    () => calcularTotaisPorEmpresa(lancamentos, dataInicio, dataFim),
    [lancamentos, dataInicio, dataFim],
  );

  const totalPeriodo = useMemo(() => totais.reduce((soma, e) => soma + e.total, 0), [totais]);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="bg-white rounded-2xl border border-linha px-4 py-3 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-apoio uppercase tracking-wide">Período</h3>
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
            />
          </div>
        </div>
      </div>

      <div className="bg-marca rounded-2xl px-4 py-4 text-white flex items-center justify-between">
        <span className="text-sm font-semibold opacity-90">Total do período (todas as empresas)</span>
        <span className="text-xl font-bold">{formatarMoeda(totalPeriodo)}</span>
      </div>

      {totais.length === 0 ? (
        <p className="text-sm text-apoio px-1">Nenhuma venda para empresas nesse período.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {totais.map((e) => {
            const aberta = expandida === e.empresa_nome;
            return (
              <div key={e.empresa_nome} className="bg-white rounded-2xl border border-linha overflow-hidden">
                <button
                  onClick={() => setExpandida(aberta ? null : e.empresa_nome)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="text-left min-w-0">
                    <p className="text-sm font-bold text-tinta truncate">{e.empresa_nome}</p>
                    <p className="text-xs text-apoio">{e.lancamentos.length} lançamento(s)</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-tinta">{formatarMoeda(e.total)}</span>
                    {aberta ? <ChevronUp size={18} className="text-apoio" /> : <ChevronDown size={18} className="text-apoio" />}
                  </div>
                </button>

                {aberta && (
                  <div className="px-4 pb-4 border-t border-linha pt-3 flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      {FORMAS_PAGAMENTO.map((f) => (
                        <div key={f} className="bg-fundo rounded-xl px-2.5 py-2 text-center">
                          <p className="text-[10px] font-semibold text-apoio uppercase">{ROTULO_FORMA_PAGAMENTO[f]}</p>
                          <p className="text-sm font-bold text-tinta">{formatarMoeda(e.por_forma_pagamento[f])}</p>
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-linha">
                      {[...e.lancamentos]
                        .sort((a, b) => a.data.localeCompare(b.data))
                        .map((l) => {
                          const item = itens.find((i) => i.id === l.item_id);
                          return (
                            <div key={l.id} className="flex items-center justify-between py-2 text-sm">
                              <span className="text-tinta">
                                {formatarDataCurta(l.data)} · {l.quantidade}x {item?.nome ?? "Item"}
                              </span>
                              <span className="font-semibold text-tinta">
                                {formatarMoeda(l.quantidade * l.valor_unitario)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
