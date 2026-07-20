import { AlertTriangle } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import AvisoRecuperarBackup from "./AvisoRecuperarBackup";

export default function ZonaDeRiscoLancamentos() {
  const { apagarTodosLancamentosPor } = useDados();

  function apagarVendas() {
    if (
      confirm(
        "Isso vai apagar TODOS os lançamentos de vendas (inclusive os de exemplo) e reabrir todos os dias fechados. Dá pra recuperar logo em seguida, mas some se você apagar tudo de novo. Confirmar?",
      )
    ) {
      apagarTodosLancamentosPor();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <AvisoRecuperarBackup />
      <div className="bg-white rounded-2xl border border-erro/30 px-4 py-3 flex flex-col gap-2 md:max-w-md">
        <h3 className="flex items-center gap-1.5 text-xs font-bold text-erro uppercase tracking-wide">
          <AlertTriangle size={14} /> Zona de risco
        </h3>
        <p className="text-xs text-apoio">
          Apaga todos os lançamentos de venda (inclusive os dados de exemplo) e reabre os dias fechados. Fica um
          backup pra recuperar caso clique sem querer — mas some se apagar tudo de novo. Use antes de começar a usar
          de verdade, ou depois de um treinamento.
        </p>
        <button
          onClick={apagarVendas}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-erro border border-erro"
        >
          Apagar todos os lançamentos
        </button>
      </div>
    </div>
  );
}
