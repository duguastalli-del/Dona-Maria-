import { Printer, X } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import type { TotalEmpresaPeriodo } from "../lib/calculos";
import { valorLancamento } from "../lib/calculos";
import { formatarDataCurta, formatarMoeda, hojeISO } from "../lib/format";

interface Props {
  dados: TotalEmpresaPeriodo;
  dataInicio: string;
  dataFim: string;
  onFechar: () => void;
}

export default function ModalRelatorioEmpresa({ dados, dataInicio, dataFim, onFechar }: Props) {
  const { itens } = useDados();

  const lancamentosOrdenados = [...dados.lancamentos].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40" onClick={onFechar}>
      <div
        className="w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="no-print flex items-center justify-between px-5 py-4 border-b border-linha">
          <h2 className="text-lg font-bold text-tinta">Relatório de consumo</h2>
          <button onClick={onFechar} className="p-1 text-apoio" aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <div className="relatorio-print flex flex-col gap-5 px-6 py-6 overflow-y-auto">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Dona Maria" className="w-14 h-14 object-contain shrink-0" />
            <div>
              <p className="text-lg font-bold text-tinta leading-tight">Restaurante Dona Maria</p>
              <p className="text-sm text-apoio leading-tight">Relatório de consumo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] font-bold text-apoio uppercase tracking-wide">Empresa</p>
              <p className="font-semibold text-tinta">{dados.empresa_nome}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-apoio uppercase tracking-wide">Período</p>
              <p className="font-semibold text-tinta">
                {formatarDataCurta(dataInicio)} a {formatarDataCurta(dataFim)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-apoio uppercase tracking-wide">Emitido em</p>
              <p className="font-semibold text-tinta">{formatarDataCurta(hojeISO())}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-apoio uppercase tracking-wide">Total de lançamentos</p>
              <p className="font-semibold text-tinta">{dados.lancamentos.length}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-apoio uppercase tracking-wide mb-1">Resumo por item</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-tinta">
                  <th className="text-left py-1.5 font-bold text-tinta">Item</th>
                  <th className="text-right py-1.5 font-bold text-tinta">Qtd</th>
                  <th className="text-right py-1.5 font-bold text-tinta">Total</th>
                </tr>
              </thead>
              <tbody>
                {dados.por_item.map((ri) => {
                  const item = itens.find((i) => i.id === ri.item_id);
                  return (
                    <tr key={ri.item_id} className="border-b border-linha">
                      <td className="py-1.5 text-tinta">{item?.nome ?? "Item"}</td>
                      <td className="py-1.5 text-right text-tinta">{ri.quantidade}</td>
                      <td className="py-1.5 text-right font-semibold text-tinta">{formatarMoeda(ri.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xs font-bold text-apoio uppercase tracking-wide mb-1">Detalhamento por lançamento</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-tinta">
                  <th className="text-left py-1.5 font-bold text-tinta">Data</th>
                  <th className="text-left py-1.5 font-bold text-tinta">Item</th>
                  <th className="text-right py-1.5 font-bold text-tinta">Qtd</th>
                  <th className="text-right py-1.5 font-bold text-tinta">Vl. unit.</th>
                  <th className="text-right py-1.5 font-bold text-tinta">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lancamentosOrdenados.map((l) => {
                  const item = itens.find((i) => i.id === l.item_id);
                  return (
                    <tr key={l.id} className="border-b border-linha">
                      <td className="py-1.5 text-tinta">{formatarDataCurta(l.data)}</td>
                      <td className="py-1.5 text-tinta">{item?.nome ?? "Item"}</td>
                      <td className="py-1.5 text-right text-tinta">{l.quantidade}</td>
                      <td className="py-1.5 text-right text-tinta">{formatarMoeda(l.valor_unitario)}</td>
                      <td className="py-1.5 text-right font-semibold text-tinta">{formatarMoeda(valorLancamento(l))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between bg-fundo rounded-xl px-4 py-3 mt-1">
            <span className="text-sm font-bold text-tinta uppercase tracking-wide">Total geral</span>
            <span className="text-xl font-bold text-marca">{formatarMoeda(dados.total)}</span>
          </div>
        </div>

        <div className="no-print flex gap-2 px-5 py-4 border-t border-linha">
          <button
            onClick={onFechar}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-tinta border border-linha"
          >
            Fechar
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white bg-marca"
          >
            <Printer size={16} /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
