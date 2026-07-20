import { Building2, ClipboardList, HandCoins, History, Receipt } from "lucide-react";

export type Aba = "lancamentos" | "fechamento" | "empresas" | "fiados" | "historico";

export const ITENS_NAV: { id: Aba; rotulo: string; Icone: typeof ClipboardList }[] = [
  { id: "lancamentos", rotulo: "Lançamentos", Icone: ClipboardList },
  { id: "fechamento", rotulo: "Fechamento", Icone: Receipt },
  { id: "empresas", rotulo: "Empresas", Icone: Building2 },
  { id: "fiados", rotulo: "Fiados", Icone: HandCoins },
  { id: "historico", rotulo: "Histórico", Icone: History },
];

export default function BottomNav({ ativa, onMudar }: { ativa: Aba; onMudar: (aba: Aba) => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-linha pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {ITENS_NAV.map(({ id, rotulo, Icone }) => {
          const ativo = ativa === id;
          return (
            <button
              key={id}
              onClick={() => onMudar(id)}
              className={`min-w-0 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold px-0.5 ${
                ativo ? "text-marca" : "text-apoio"
              }`}
            >
              <Icone size={19} strokeWidth={ativo ? 2.5 : 2} />
              <span className="leading-tight">{rotulo}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
