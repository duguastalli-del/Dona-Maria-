import { useState } from "react";
import { DadosProvider } from "./contexts/DadosContext";
import BottomNav, { type Aba } from "./components/BottomNav";
import Lancamentos from "./pages/Lancamentos";
import Fechamento from "./pages/Fechamento";
import Fiados from "./pages/Fiados";
import Historico from "./pages/Historico";
import { hojeISO } from "./lib/format";

const TITULOS: Record<Aba, string> = {
  lancamentos: "Lançamento do dia",
  fechamento: "Fechamento do dia",
  fiados: "Fiados",
  historico: "Histórico",
};

export default function App() {
  const [aba, setAba] = useState<Aba>("lancamentos");
  const [data, setData] = useState(hojeISO());

  return (
    <DadosProvider>
      <div className="min-h-screen bg-fundo flex flex-col">
        <header className="bg-white border-b border-linha px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-marca text-white font-black flex items-center justify-center text-sm shrink-0">
            DM
          </div>
          <div>
            <p className="text-[11px] font-semibold text-apoio leading-none">Restaurante Dona Maria</p>
            <h1 className="text-base font-bold text-tinta leading-tight">{TITULOS[aba]}</h1>
          </div>
        </header>

        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
          {aba === "lancamentos" && <Lancamentos data={data} onMudarData={setData} />}
          {aba === "fechamento" && <Fechamento data={data} onMudarData={setData} />}
          {aba === "fiados" && <Fiados />}
          {aba === "historico" && <Historico />}
        </main>

        <BottomNav ativa={aba} onMudar={setAba} />
      </div>
    </DadosProvider>
  );
}
