import { ClipboardList, HandCoins, History, Receipt } from "lucide-react";

export type Aba = "lancamentos" | "fechamento" | "fiados" | "historico";

const ITENS: { id: Aba; rotulo: string; Icone: typeof ClipboardList }[] = [
  { id: "lancamentos", rotulo: "Lançamentos", Icone: ClipboardList },
  { id: "fechamento", rotulo: "Fechamento", Icone: Receipt },
  { id: "fiados", rotulo: "Fiados", Icone: HandCoins },
  { id: "historico", rotulo: "Histórico", Icone: History },
];

export default function BottomNav({ ativa, onMudar }: { ativa: Aba; onMudar: (aba: Aba) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-linha pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {ITENS.map(({ id, rotulo, Icone }) => {
          const ativo = ativa === id;
          return (
            <button
              key={id}
              onClick={() => onMudar(id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                ativo ? "text-marca" : "text-apoio"
              }`}
            >
              <Icone size={20} strokeWidth={ativo ? 2.5 : 2} />
              {rotulo}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
