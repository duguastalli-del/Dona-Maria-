import { useMemo, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import SeletorData from "../components/SeletorData";
import { calcularFechamento, calcularTotalMes } from "../lib/calculos";
import { formatarMoeda } from "../lib/format";
import { CANAIS, FORMAS_PAGAMENTO, ROTULO_CANAL, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";

function LinhaValor({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm ${destaque ? "font-bold text-tinta" : "text-apoio"}`}>{rotulo}</span>
      <span className={`text-sm ${destaque ? "font-bold text-tinta" : "font-semibold text-tinta"}`}>
        {formatarMoeda(valor)}
      </span>
    </div>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-linha px-4 py-3">
      <h3 className="text-xs font-bold text-apoio uppercase tracking-wide mb-1">{titulo}</h3>
      <div className="divide-y divide-linha">{children}</div>
    </div>
  );
}

export default function Fechamento({ data, onMudarData }: { data: string; onMudarData: (data: string) => void }) {
  const { lancamentos, diaStatus, fecharDiaPor, reabrirDiaPor } = useDados();
  const status = diaStatus(data);
  const fechamento = useMemo(() => calcularFechamento(data, lancamentos), [data, lancamentos]);
  const totalMes = useMemo(() => calcularTotalMes(data, lancamentos), [data, lancamentos]);

  const [dinheiroContado, setDinheiroContado] = useState<string>(
    status.dinheiro_contado != null ? String(status.dinheiro_contado) : "",
  );

  const dinheiroContadoNum = Number(dinheiroContado.replace(",", "."));
  const dinheiroValido = dinheiroContado.trim() !== "" && !Number.isNaN(dinheiroContadoNum);
  const diferenca = dinheiroValido ? dinheiroContadoNum - fechamento.dinheiro_esperado : null;

  function pedirFechamento() {
    if (!dinheiroValido) {
      alert("Informe o valor de dinheiro contado no caixa antes de fechar o dia.");
      return;
    }
    if (confirm(`Fechar o dia ${data}? Os lançamentos ficarão travados até reabertura.`)) {
      fecharDiaPor(data, dinheiroContadoNum);
    }
  }

  function pedirReabertura() {
    if (confirm(`Reabrir o dia ${data}? Isso vai permitir novos lançamentos e edições.`)) {
      reabrirDiaPor(data);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <SeletorData data={data} onMudar={onMudarData} />

      <div className="bg-marca rounded-2xl px-4 py-4 text-white flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold opacity-90">Total geral vendido</span>
          <span className="text-2xl font-bold">{formatarMoeda(fechamento.total_geral)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/20 pt-2">
          <span className="text-xs font-semibold opacity-90">Total do mês</span>
          <span className="text-base font-bold">{formatarMoeda(totalMes)}</span>
        </div>
      </div>

      <Cartao titulo="Total por canal">
        {CANAIS.map((c) => (
          <LinhaValor key={c} rotulo={ROTULO_CANAL[c]} valor={fechamento.total_por_canal[c]} />
        ))}
      </Cartao>

      <Cartao titulo="Vendas do dia — por forma de pagamento">
        {FORMAS_PAGAMENTO.map((f) => (
          <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={fechamento.vendas_dia_por_forma_pagamento[f]} />
        ))}
      </Cartao>

      <Cartao titulo="Fiados quitados hoje — por forma de pagamento">
        {FORMAS_PAGAMENTO.map((f) => (
          <LinhaValor
            key={f}
            rotulo={ROTULO_FORMA_PAGAMENTO[f]}
            valor={fechamento.fiados_quitados_hoje_por_forma_pagamento[f]}
          />
        ))}
        <LinhaValor rotulo="Total quitado hoje" valor={fechamento.fiado_quitado_hoje} destaque />
      </Cartao>

      <Cartao titulo="Total por forma de pagamento (geral)">
        {FORMAS_PAGAMENTO.map((f) => (
          <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={fechamento.total_por_forma_pagamento[f]} destaque />
        ))}
      </Cartao>

      <Cartao titulo="Fiado">
        <LinhaValor rotulo="Aberto (gerado hoje, ainda não pago)" valor={fechamento.fiado_aberto} />
        <LinhaValor rotulo="Quitado hoje" valor={fechamento.fiado_quitado_hoje} />
      </Cartao>

      <div className="bg-white rounded-2xl border border-linha px-4 py-3 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-apoio uppercase tracking-wide">Conferência de caixa (dinheiro)</h3>
        <LinhaValor rotulo="Dinheiro esperado" valor={fechamento.dinheiro_esperado} destaque />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-tinta block">Dinheiro contado no caixa</label>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={dinheiroContado}
            onChange={(e) => setDinheiroContado(e.target.value)}
            disabled={status.fechado}
            placeholder="0,00"
            className="w-full rounded-xl px-3 py-3 text-base outline-none bg-fundo border border-linha disabled:opacity-60"
          />
        </div>

        {diferenca !== null && (
          <div
            className={`rounded-xl px-3 py-2.5 flex items-center justify-between text-sm font-bold ${
              diferenca === 0
                ? "bg-sucesso/10 text-sucesso"
                : diferenca > 0
                  ? "bg-aviso/10 text-aviso"
                  : "bg-erro/10 text-erro"
            }`}
          >
            <span>Diferença de caixa</span>
            <span>
              {diferenca > 0 ? "+" : ""}
              {formatarMoeda(diferenca)}
            </span>
          </div>
        )}

        {status.fechado ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-aviso text-sm font-semibold">
              <Lock size={16} /> Dia fechado
            </div>
            <button
              onClick={pedirReabertura}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold border border-aviso text-aviso"
            >
              <Unlock size={15} /> Reabrir o dia
            </button>
          </div>
        ) : (
          <button onClick={pedirFechamento} className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-marca">
            Fechar o dia
          </button>
        )}
      </div>
    </div>
  );
}
