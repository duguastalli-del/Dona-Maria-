import { hojeISO, primeiroDiaDoMesISO, somarDiasISO } from "../lib/format";

interface Props {
  dataInicio: string;
  dataFim: string;
  onMudar: (dataInicio: string, dataFim: string) => void;
}

const PRESETS_DIAS = [
  { rotulo: "Hoje", dias: 0 },
  { rotulo: "7 dias", dias: 7 },
  { rotulo: "15 dias", dias: 15 },
];

export default function SeletorPeriodo({ dataInicio, dataFim, onMudar }: Props) {
  const hoje = hojeISO();

  return (
    <div className="bg-white rounded-2xl border border-linha px-4 py-3 flex flex-col gap-3">
      <h3 className="text-xs font-bold text-apoio uppercase tracking-wide">Período</h3>

      <div className="flex flex-wrap gap-2">
        {PRESETS_DIAS.map((p) => (
          <button
            key={p.rotulo}
            onClick={() => onMudar(p.dias === 0 ? hoje : somarDiasISO(hoje, -p.dias), hoje)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-linha text-tinta hover:bg-fundo"
          >
            {p.rotulo}
          </button>
        ))}
        <button
          onClick={() => onMudar(primeiroDiaDoMesISO(hoje), hoje)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-linha text-tinta hover:bg-fundo"
        >
          Este mês
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-tinta block">Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => onMudar(e.target.value, dataFim)}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-tinta block">Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => onMudar(dataInicio, e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
          />
        </div>
      </div>
    </div>
  );
}
