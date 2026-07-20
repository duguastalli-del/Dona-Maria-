import { Settings } from "lucide-react";
import { ITENS_NAV, type Aba } from "./BottomNav";

interface Props {
  ativa: Aba;
  mostrandoCardapio: boolean;
  onMudarAba: (aba: Aba) => void;
  onAbrirCardapio: () => void;
}

export default function Sidebar({ ativa, mostrandoCardapio, onMudarAba, onAbrirCardapio }: Props) {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-white border-r border-linha min-h-screen px-4 py-6 gap-6">
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-marca text-white font-black flex items-center justify-center text-sm shrink-0">
          DM
        </div>
        <div>
          <p className="text-[11px] font-semibold text-apoio leading-none">Restaurante</p>
          <p className="text-sm font-bold text-tinta leading-tight">Dona Maria</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {ITENS_NAV.map(({ id, rotulo, Icone }) => {
          const ativo = !mostrandoCardapio && ativa === id;
          return (
            <button
              key={id}
              onClick={() => onMudarAba(id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-colors ${
                ativo ? "bg-marca text-white" : "text-tinta hover:bg-fundo"
              }`}
            >
              <Icone size={18} />
              {rotulo}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <button
          onClick={onAbrirCardapio}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-left transition-colors ${
            mostrandoCardapio ? "bg-marca text-white" : "text-tinta hover:bg-fundo"
          }`}
        >
          <Settings size={18} />
          Cardápio
        </button>
      </div>
    </aside>
  );
}
