import { ChevronLeft, ChevronRight } from "lucide-react";
import { diaDaSemana, formatarDataCurta, hojeISO, somarDiasISO } from "../lib/format";

export default function SeletorData({ data, onMudar }: { data: string; onMudar: (data: string) => void }) {
  const ehHoje = data === hojeISO();

  return (
    <div className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-linha px-3 py-3">
      <button onClick={() => onMudar(somarDiasISO(data, -1))} className="p-1.5 text-apoio" aria-label="Dia anterior">
        <ChevronLeft size={20} />
      </button>
      <div className="flex-1 text-center">
        <p className="text-sm font-bold text-tinta">{diaDaSemana(data)}</p>
        <p className="text-xs text-apoio">{formatarDataCurta(data)}{ehHoje ? " · Hoje" : ""}</p>
      </div>
      <button onClick={() => onMudar(somarDiasISO(data, 1))} className="p-1.5 text-apoio" aria-label="Próximo dia">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
