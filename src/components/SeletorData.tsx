import { ChevronLeft, ChevronRight } from "lucide-react";
import { diaDaSemana, formatarDataCurta, hojeISO } from "../lib/format";

function somarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  d.setDate(d.getDate() + dias);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SeletorData({ data, onMudar }: { data: string; onMudar: (data: string) => void }) {
  const ehHoje = data === hojeISO();

  return (
    <div className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-linha px-3 py-3">
      <button onClick={() => onMudar(somarDias(data, -1))} className="p-1.5 text-apoio" aria-label="Dia anterior">
        <ChevronLeft size={20} />
      </button>
      <div className="flex-1 text-center">
        <p className="text-sm font-bold text-tinta">{diaDaSemana(data)}</p>
        <p className="text-xs text-apoio">{formatarDataCurta(data)}{ehHoje ? " · Hoje" : ""}</p>
      </div>
      <button onClick={() => onMudar(somarDias(data, 1))} className="p-1.5 text-apoio" aria-label="Próximo dia">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
