import { RotateCcw, X } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import { formatarDataHora } from "../lib/format";

export default function AvisoRecuperarBackup() {
  const { backupApagados, restaurarBackupPor, descartarBackupPor } = useDados();

  if (!backupApagados) return null;

  function restaurar() {
    if (
      confirm(
        `Restaurar ${backupApagados!.lancamentos.length} lançamento(s) apagado(s) em ${formatarDataHora(backupApagados!.em)}? Isso substitui os lançamentos atuais — o que foi lançado depois da exclusão será perdido.`,
      )
    ) {
      restaurarBackupPor();
    }
  }

  return (
    <div className="bg-aviso/10 border border-aviso/30 rounded-2xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-aviso">
          {backupApagados.lancamentos.length} lançamento(s) apagado(s) em {formatarDataHora(backupApagados.em)}.
        </p>
        <p className="text-xs text-aviso/80">Ainda dá pra recuperar, antes que outro apagar tudo sobrescreva.</p>
      </div>
      <button
        onClick={restaurar}
        className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white bg-aviso"
      >
        <RotateCcw size={14} /> Recuperar
      </button>
      <button onClick={descartarBackupPor} className="shrink-0 p-1 text-aviso" aria-label="Dispensar aviso">
        <X size={16} />
      </button>
    </div>
  );
}
