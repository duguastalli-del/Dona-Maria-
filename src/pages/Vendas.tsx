import { useMemo, useState } from "react";
import { useDados } from "../contexts/DadosContext";
import SeletorPeriodo from "../components/SeletorPeriodo";
import { calcularTotaisPeriodo } from "../lib/calculos";
import { formatarMoeda, hojeISO, primeiroDiaDoMesISO } from "../lib/format";
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

export default function Vendas() {
  const { lancamentos } = useDados();
  const hoje = hojeISO();
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesISO(hoje));
  const [dataFim, setDataFim] = useState(hoje);

  const totais = useMemo(
    () => calcularTotaisPeriodo(dataInicio, dataFim, lancamentos),
    [dataInicio, dataFim, lancamentos],
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      <SeletorPeriodo
        dataInicio={dataInicio}
        dataFim={dataFim}
        onMudar={(inicio, fim) => {
          setDataInicio(inicio);
          setDataFim(fim);
        }}
      />

      <div className="bg-marca rounded-2xl px-4 py-4 text-white flex items-center justify-between">
        <span className="text-sm font-semibold opacity-90">Total vendido no período</span>
        <span className="text-2xl font-bold">{formatarMoeda(totais.total_geral)}</span>
      </div>

      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4 md:items-start">
        <Cartao titulo="Total por canal">
          {CANAIS.map((c) => (
            <LinhaValor key={c} rotulo={ROTULO_CANAL[c]} valor={totais.total_por_canal[c]} />
          ))}
        </Cartao>

        <Cartao titulo="Vendas do período — por forma de pagamento">
          {FORMAS_PAGAMENTO.map((f) => (
            <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={totais.vendas_periodo_por_forma_pagamento[f]} />
          ))}
        </Cartao>

        <Cartao titulo="Fiados quitados no período — por forma de pagamento">
          {FORMAS_PAGAMENTO.map((f) => (
            <LinhaValor
              key={f}
              rotulo={ROTULO_FORMA_PAGAMENTO[f]}
              valor={totais.fiados_quitados_periodo_por_forma_pagamento[f]}
            />
          ))}
          <LinhaValor rotulo="Total quitado no período" valor={totais.fiado_quitado_periodo} destaque />
        </Cartao>

        <Cartao titulo="Total por forma de pagamento (geral)">
          {FORMAS_PAGAMENTO.map((f) => (
            <LinhaValor key={f} rotulo={ROTULO_FORMA_PAGAMENTO[f]} valor={totais.total_por_forma_pagamento[f]} destaque />
          ))}
        </Cartao>

        <Cartao titulo="Fiado">
          <LinhaValor rotulo="Gerado no período" valor={totais.fiado_gerado_periodo} />
          <LinhaValor rotulo="Ainda em aberto" valor={totais.fiado_aberto_periodo} />
          <LinhaValor rotulo="Quitado no período" valor={totais.fiado_quitado_periodo} />
        </Cartao>
      </div>
    </div>
  );
}
