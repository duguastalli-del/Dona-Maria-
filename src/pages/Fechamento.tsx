import { useEffect, useMemo, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import SeletorData from "../components/SeletorData";
import { calcularFechamento, calcularTotaisPeriodo } from "../lib/calculos";
import { formatarDataCurta, formatarMoeda, hojeISO, primeiroDiaDoMesISO, somarDiasISO } from "../lib/format";
import { CANAIS, FORMAS_PAGAMENTO, ROTULO_CANAL, ROTULO_FORMA_PAGAMENTO } from "../lib/rotulos";
import type { TotaisPorCanal, TotaisPorFormaPagamento } from "../lib/types";

type Modo = "dia" | "semana" | "quinzena" | "mes" | "personalizado";

const MODOS: { id: Modo; rotulo: string }[] = [
  { id: "dia", rotulo: "Dia" },
  { id: "semana", rotulo: "Semana" },
  { id: "quinzena", rotulo: "Quinzena" },
  { id: "mes", rotulo: "Mês" },
  { id: "personalizado", rotulo: "Personalizado" },
];

interface ResumoComum {
  total_geral: number;
  total_por_canal: TotaisPorCanal;
  vendas_por_forma_pagamento: TotaisPorFormaPagamento;
  quitados_por_forma_pagamento: TotaisPorFormaPagamento;
  total_por_forma_pagamento: TotaisPorFormaPagamento;
  fiado_aberto: number;
  quitado: number;
}

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
  const { lancamentos, diaStatus, fecharDiaPor, reabrirDiaPor, definirTrocoInicialPor } = useDados();
  const [modo, setModo] = useState<Modo>("dia");
  const [inicioPersonalizado, setInicioPersonalizado] = useState(primeiroDiaDoMesISO(hojeISO()));
  const [fimPersonalizado, setFimPersonalizado] = useState(hojeISO());

  const status = diaStatus(data);
  const fechamentoDia = useMemo(() => calcularFechamento(data, lancamentos), [data, lancamentos]);

  const intervalo = useMemo(() => {
    const hoje = hojeISO();
    switch (modo) {
      case "semana":
        return { inicio: somarDiasISO(hoje, -7), fim: hoje };
      case "quinzena":
        return { inicio: somarDiasISO(hoje, -15), fim: hoje };
      case "mes":
        return { inicio: primeiroDiaDoMesISO(hoje), fim: hoje };
      case "personalizado":
        return { inicio: inicioPersonalizado, fim: fimPersonalizado };
      default:
        return { inicio: data, fim: data };
    }
  }, [modo, inicioPersonalizado, fimPersonalizado, data]);

  const totaisPeriodo = useMemo(
    () => calcularTotaisPeriodo(intervalo.inicio, intervalo.fim, lancamentos),
    [intervalo, lancamentos],
  );

  const ehDia = modo === "dia";
  const escopo = ehDia ? "dia" : "período";

  const resumo: ResumoComum = ehDia
    ? {
        total_geral: fechamentoDia.total_geral,
        total_por_canal: fechamentoDia.total_por_canal,
        vendas_por_forma_pagamento: fechamentoDia.vendas_dia_por_forma_pagamento,
        quitados_por_forma_pagamento: fechamentoDia.quitados_hoje_por_forma_pagamento,
        total_por_forma_pagamento: fechamentoDia.total_por_forma_pagamento,
        fiado_aberto: fechamentoDia.fiado_aberto,
        quitado: fechamentoDia.quitado_hoje,
      }
    : {
        total_geral: totaisPeriodo.total_geral,
        total_por_canal: totaisPeriodo.total_por_canal,
        vendas_por_forma_pagamento: totaisPeriodo.vendas_periodo_por_forma_pagamento,
        quitados_por_forma_pagamento: totaisPeriodo.quitados_periodo_por_forma_pagamento,
        total_por_forma_pagamento: totaisPeriodo.total_por_forma_pagamento,
        fiado_aberto: totaisPeriodo.fiado_aberto_periodo,
        quitado: totaisPeriodo.quitado_periodo,
      };

  const [dinheiroContado, setDinheiroContado] = useState<string>(
    status.dinheiro_contado != null ? String(status.dinheiro_contado) : "",
  );
  const [trocoInicial, setTrocoInicial] = useState<string>(
    status.troco_inicial != null ? String(status.troco_inicial) : "",
  );

  useEffect(() => {
    setDinheiroContado(status.dinheiro_contado != null ? String(status.dinheiro_contado) : "");
    setTrocoInicial(status.troco_inicial != null ? String(status.troco_inicial) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, status.dinheiro_contado, status.troco_inicial]);

  const dinheiroContadoNum = Number(dinheiroContado.replace(",", "."));
  const dinheiroValido = dinheiroContado.trim() !== "" && !Number.isNaN(dinheiroContadoNum);
  const trocoInicialNum = Number(trocoInicial.replace(",", ".")) || 0;
  const dinheiroEsperadoTotal = fechamentoDia.dinheiro_esperado + trocoInicialNum;
  const diferenca = dinheiroValido ? dinheiroContadoNum - dinheiroEsperadoTotal : null;

  function salvarTroco() {
    definirTrocoInicialPor(data, trocoInicialNum);
  }

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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MODOS.map((m) => (
          <button
            key={m.id}
            onClick={() => setModo(m.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
              modo === m.id ? "bg-marca text-white border-marca" : "bg-white text-tinta border-linha"
            }`}
          >
            {m.rotulo}
          </button>
        ))}
      </div>

      {ehDia ? (
        <SeletorData data={data} onMudar={onMudarData} />
      ) : modo === "personalizado" ? (
        <div className="bg-white rounded-2xl border border-linha px-4 py-3 flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Início</label>
            <input
              type="date"
              value={inicioPersonalizado}
              onChange={(e) => setInicioPersonalizado(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Fim</label>
            <input
              type="date"
              value={fimPersonalizado}
              onChange={(e) => setFimPersonalizado(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-linha px-4 py-3 text-sm font-semibold text-tinta text-center">
          {formatarDataCurta(intervalo.inicio)} – {formatarDataCurta(intervalo.fim)}
        </div>
      )}

      <div className="bg-marca rounded-2xl px-4 py-4 text-white flex items-center justify-between">
        <span className="text-sm font-semibold opacity-90">Total vendido no {escopo}</span>
        <span className="text-2xl font-bold">{formatarMoeda(resumo.total_geral)}</span>
      </div>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4 md:items-start">
        <Cartao titulo="Total por canal">
          {CANAIS.map((c) => (
            <LinhaValor key={c} rotulo={ROTULO_CANAL[c]} valor={resumo.total_por_canal[c]} />
          ))}
        </Cartao>

        <Cartao titulo={`Vendas do ${escopo} — por forma de pagamento`}>
          {FORMAS_PAGAMENTO.map((f) => (
            <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={resumo.vendas_por_forma_pagamento[f]} />
          ))}
        </Cartao>

        <Cartao titulo={`Fiado/Empresa quitados no ${escopo} — por forma de pagamento`}>
          {FORMAS_PAGAMENTO.map((f) => (
            <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={resumo.quitados_por_forma_pagamento[f]} />
          ))}
          <LinhaValor rotulo={`Total quitado no ${escopo}`} valor={resumo.quitado} destaque />
        </Cartao>

        <Cartao titulo="Total por forma de pagamento (geral)">
          {FORMAS_PAGAMENTO.map((f) => (
            <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={resumo.total_por_forma_pagamento[f]} destaque />
          ))}
        </Cartao>

        <Cartao titulo="Fiado">
          <LinhaValor rotulo={`Aberto (gerado no ${escopo}, ainda não pago)`} valor={resumo.fiado_aberto} />
        </Cartao>
      </div>

      {ehDia && (
        <div className="bg-white rounded-2xl border border-linha px-4 py-3 flex flex-col gap-3 md:max-w-md">
          <h3 className="text-xs font-bold text-apoio uppercase tracking-wide">Conferência de caixa (dinheiro)</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-tinta block">Troco inicial (fundo de caixa)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={trocoInicial}
              onChange={(e) => setTrocoInicial(e.target.value)}
              onBlur={salvarTroco}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              disabled={status.fechado}
              placeholder="0,00"
              className="w-full rounded-xl px-3 py-3 text-base outline-none bg-fundo border border-linha disabled:opacity-60"
            />
            <p className="text-xs text-apoio">
              Dinheiro colocado no caixa pra dar troco — não entra no total vendido, só na conferência.
            </p>
          </div>

          <LinhaValor rotulo="Vendas em dinheiro" valor={fechamentoDia.dinheiro_esperado} />
          <LinhaValor rotulo="+ Troco inicial" valor={trocoInicialNum} />
          <LinhaValor rotulo="Dinheiro esperado no caixa" valor={dinheiroEsperadoTotal} destaque />

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
      )}
    </div>
  );
}
