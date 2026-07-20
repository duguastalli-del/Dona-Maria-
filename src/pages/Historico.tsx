import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { calcularFechamento } from "../lib/calculos";
import { formatarDataExtenso, formatarMoeda } from "../lib/format";
import Fechamento from "./Fechamento";

export default function Historico() {
  const { dias, lancamentos } = useDados();
  const [expandido, setExpandido] = useState<string | null>(null);

  const diasFechados = useMemo(
    () => dias.filter((d) => d.fechado).sort((a, b) => b.data.localeCompare(a.data)),
    [dias],
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h2 className="text-sm font-bold text-tinta px-1">Dias fechados ({diasFechados.length})</h2>

      {diasFechados.length === 0 ? (
        <p className="text-sm text-apoio px-1">Nenhum dia fechado ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {diasFechados.map((dia) => {
            const fechamento = calcularFechamento(dia.data, lancamentos);
            const diferenca = (dia.dinheiro_contado ?? 0) - fechamento.dinheiro_esperado;
            const aberto = expandido === dia.data;
            return (
              <div key={dia.data} className="bg-white rounded-2xl border border-linha overflow-hidden">
                <button
                  onClick={() => setExpandido(aberto ? null : dia.data)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="text-left">
                    <p className="text-sm font-bold text-tinta">{formatarDataExtenso(dia.data)}</p>
                    <p className="text-xs text-apoio">Total: {formatarMoeda(fechamento.total_geral)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        diferenca === 0 ? "text-sucesso" : diferenca > 0 ? "text-aviso" : "text-erro"
                      }`}
                    >
                      {diferenca > 0 ? "+" : ""}
                      {formatarMoeda(diferenca)}
                    </span>
                    {aberto ? <ChevronUp size={18} className="text-apoio" /> : <ChevronDown size={18} className="text-apoio" />}
                  </div>
                </button>

                {aberto && (
                  <div className="px-3 pb-3 border-t border-linha pt-3">
                    <Fechamento data={dia.data} onMudarData={setExpandido as (d: string) => void} />
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
