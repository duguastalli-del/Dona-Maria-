import { useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { DadosProvider } from "./contexts/DadosContext";
import BottomNav, { type Aba } from "./components/BottomNav";
import Lancamentos from "./pages/Lancamentos";
import Fechamento from "./pages/Fechamento";
import Empresas from "./pages/Empresas";
import Fiados from "./pages/Fiados";
import Historico from "./pages/Historico";
import Cardapio from "./pages/Cardapio";
import { hojeISO } from "./lib/format";

const TITULOS: Record<Aba, string> = {
  lancamentos: "Lançamento do dia",
  fechamento: "Fechamento do dia",
  empresas: "Empresas",
  fiados: "Fiados",
  historico: "Histórico",
};

export default function App() {
  const [aba, setAba] = useState<Aba>("lancamentos");
  const [data, setData] = useState(hojeISO());
  const [mostrarCardapio, setMostrarCardapio] = useState(false);

  return (
    <DadosProvider>
      <div className="min-h-screen bg-fundo flex flex-col">
        <header className="bg-white border-b border-linha px-4 py-3 flex items-center gap-3">
          {mostrarCardapio ? (
            <button onClick={() => setMostrarCardapio(false)} className="p-1 text-tinta" aria-label="Voltar">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-marca text-white font-black flex items-center justify-center text-sm shrink-0">
              DM
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-apoio leading-none">Restaurante Dona Maria</p>
            <h1 className="text-base font-bold text-tinta leading-tight truncate">
              {mostrarCardapio ? "Cardápio" : TITULOS[aba]}
            </h1>
          </div>
          {!mostrarCardapio && (
            <button onClick={() => setMostrarCardapio(true)} className="p-1.5 text-apoio" aria-label="Editar cardápio">
              <Settings size={20} />
            </button>
          )}
        </header>

        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-24">
          {mostrarCardapio ? (
            <Cardapio />
          ) : (
            <>
              {aba === "lancamentos" && <Lancamentos data={data} onMudarData={setData} />}
              {aba === "fechamento" && <Fechamento data={data} onMudarData={setData} />}
              {aba === "empresas" && <Empresas />}
              {aba === "fiados" && <Fiados />}
              {aba === "historico" && <Historico />}
            </>
          )}
        </main>

        <BottomNav
          ativa={aba}
          onMudar={(novaAba) => {
            setMostrarCardapio(false);
            setAba(novaAba);
          }}
        />
      </div>
    </DadosProvider>
  );
}
