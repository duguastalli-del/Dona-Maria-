import { useState } from "react";
import { ArrowLeft, Settings } from "lucide-react";
import { DadosProvider } from "./contexts/DadosContext";
import BottomNav, { type Aba } from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import Lancamentos from "./pages/Lancamentos";
import Fechamento from "./pages/Fechamento";
import Empresas from "./pages/Empresas";
import Fiados from "./pages/Fiados";
import Historico from "./pages/Historico";
import Cardapio from "./pages/Cardapio";
import { hojeISO } from "./lib/format";

const TITULOS: Record<Aba, string> = {
  lancamentos: "Lançamento do dia",
  fechamento: "Fechamento",
  empresas: "Empresas",
  fiados: "Fiados",
  historico: "Histórico",
};

export default function App() {
  const [aba, setAba] = useState<Aba>("lancamentos");
  const [data, setData] = useState(hojeISO());
  const [mostrarCardapio, setMostrarCardapio] = useState(false);

  function mudarAba(novaAba: Aba) {
    setMostrarCardapio(false);
    setAba(novaAba);
  }

  return (
    <DadosProvider>
      <div className="min-h-screen bg-fundo flex">
        <Sidebar
          ativa={aba}
          mostrandoCardapio={mostrarCardapio}
          onMudarAba={mudarAba}
          onAbrirCardapio={() => setMostrarCardapio(true)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-linha px-4 md:px-8 py-3 md:py-4 flex items-center gap-3">
            {mostrarCardapio ? (
              <button onClick={() => setMostrarCardapio(false)} className="md:hidden p-1 text-tinta" aria-label="Voltar">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <img src="/logo.png" alt="Dona Maria" className="md:hidden w-10 h-10 object-contain shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="md:hidden text-[11px] font-semibold text-apoio leading-none">Restaurante Dona Maria</p>
              <h1 className="text-base md:text-xl font-bold text-tinta leading-tight truncate">
                {mostrarCardapio ? "Cardápio" : TITULOS[aba]}
              </h1>
            </div>
            {!mostrarCardapio && (
              <button
                onClick={() => setMostrarCardapio(true)}
                className="md:hidden p-1.5 text-apoio"
                aria-label="Editar cardápio"
              >
                <Settings size={20} />
              </button>
            )}
          </header>

          <main className="flex-1 w-full mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-24 md:pb-10 max-w-md md:max-w-6xl">
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

          <BottomNav ativa={aba} onMudar={mudarAba} />
        </div>
      </div>
    </DadosProvider>
  );
}
