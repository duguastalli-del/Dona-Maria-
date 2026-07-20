import { Building2, ClipboardList, HandCoins, History, Receipt, TrendingUp } from "lucide-react";

export type Aba = "lancamentos" | "fechamento" | "vendas" | "empresas" | "fiados" | "historico";

export const ITENS_NAV: { id: Aba; rotulo: string; rotuloCurto: string; Icone: typeof ClipboardList }[] = [
  { id: "lancamentos", rotulo: "Lançamentos", rotuloCurto: "Lançar", Icone: ClipboardList },
  { id: "fechamento", rotulo: "Fechamento", rotuloCurto: "Fechar", Icone: Receipt },
  { id: "vendas", rotulo: "Vendas", rotuloCurto: "Vendas", Icone: TrendingUp },
  { id: "empresas", rotulo: "Empresas", rotuloCurto: "Empresas", Icone: Building2 },
  { id: "fiados", rotulo: "Fiados", rotuloCurto: "Fiados", Icone: HandCoins },
  { id: "historico", rotulo: "Histórico", rotuloCurto: "Histór.", Icone: History },
];

export default function BottomNav({ ativa, onMudar }: { ativa: Aba; onMudar: (aba: Aba) => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-linha pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-6">
        {ITENS_NAV.map(({ id, rotuloCurto, Icone }) => {
          const ativo = ativa === id;
          return (
            <button
              key={id}
              onClick={() => onMudar(id)}
              className={`min-w-0 flex flex-col items-center gap-1 py-2.5 text-[9px] font-semibold px-0.5 ${
                ativo ? "text-marca" : "text-apoio"
              }`}
            >
              <Icone size={18} strokeWidth={ativo ? 2.5 : 2} />
              <span className="leading-tight">{rotuloCurto}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
