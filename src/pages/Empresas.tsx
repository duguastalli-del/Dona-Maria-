import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, RotateCcw, XCircle } from "lucide-react";
import { useDados } from "../contexts/DadosContext";
import SeletorPeriodo from "../components/SeletorPeriodo";
import { calcularTotaisPorEmpresa } from "../lib/calculos";
import { formatarDataCurta, formatarMoeda, hojeISO, primeiroDiaDoMesISO } from "../lib/format";

export default function Empresas() {
  const { lancamentos, itens, empresas, criarEmpresa, definirStatusEmpresaPor } = useDados();
  const hoje = hojeISO();
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesISO(hoje));
  const [dataFim, setDataFim] = useState(hoje);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");

  const totais = useMemo(
    () => calcularTotaisPorEmpresa(lancamentos, dataInicio, dataFim),
    [lancamentos, dataInicio, dataFim],
  );

  const totalPeriodo = useMemo(() => totais.reduce((soma, e) => soma + e.total, 0), [totais]);

  const empresasOrdenadas = useMemo(
    () => [...empresas].sort((a, b) => Number(b.ativa) - Number(a.ativa) || a.nome.localeCompare(b.nome)),
    [empresas],
  );

  function cadastrar() {
    const nome = novoNome.trim();
    if (!nome) {
      setErroCadastro("Informe o nome da empresa.");
      return;
    }
    if (empresas.some((e) => e.nome.toLowerCase() === nome.toLowerCase())) {
      setErroCadastro("Já existe uma empresa com esse nome.");
      return;
    }
    criarEmpresa(nome);
    setNovoNome("");
    setErroCadastro("");
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="bg-white rounded-2xl border border-linha px-4 py-3 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-apoio uppercase tracking-wide">Empresas cadastradas</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={novoNome}
            onChange={(e) => {
              setNovoNome(e.target.value);
              setErroCadastro("");
            }}
            onKeyDown={(e) => e.key === "Enter" && cadastrar()}
            placeholder="Nome da nova empresa"
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none bg-fundo border border-linha"
          />
          <button
            onClick={cadastrar}
            className="shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold text-white bg-marca"
          >
            <Plus size={16} /> Cadastrar
          </button>
        </div>
        {erroCadastro && <p className="text-xs text-erro">{erroCadastro}</p>}

        {empresasOrdenadas.length === 0 ? (
          <p className="text-sm text-apoio">Nenhuma empresa cadastrada ainda.</p>
        ) : (
          <div className="divide-y divide-linha">
            {empresasOrdenadas.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <span className={`text-sm font-semibold truncate ${e.ativa ? "text-tinta" : "text-apoio line-through"}`}>
                    {e.nome}
                  </span>
                  {!e.ativa && (
                    <span className="shrink-0 text-[10px] font-bold uppercase text-apoio bg-fundo border border-linha rounded-full px-2 py-0.5">
                      Encerrada
                    </span>
                  )}
                </div>
                {e.ativa ? (
                  <button
                    onClick={() => definirStatusEmpresaPor(e.id, false)}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-erro"
                  >
                    <XCircle size={14} /> Encerrar
                  </button>
                ) : (
                  <button
                    onClick={() => definirStatusEmpresaPor(e.id, true)}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-marca"
                  >
                    <RotateCcw size={14} /> Reativar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SeletorPeriodo
        dataInicio={dataInicio}
        dataFim={dataFim}
        onMudar={(inicio, fim) => {
          setDataInicio(inicio);
          setDataFim(fim);
        }}
      />

      <div className="bg-marca rounded-2xl px-4 py-4 text-white flex items-center justify-between">
        <span className="text-sm font-semibold opacity-90">Total do período (todas as empresas)</span>
        <span className="text-xl font-bold">{formatarMoeda(totalPeriodo)}</span>
      </div>

      {totais.length === 0 ? (
        <p className="text-sm text-apoio px-1">Nenhuma venda para empresas nesse período.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {totais.map((e) => {
            const aberta = expandida === e.empresa_nome;
            return (
              <div key={e.empresa_nome} className="bg-white rounded-2xl border border-linha overflow-hidden">
                <button
                  onClick={() => setExpandida(aberta ? null : e.empresa_nome)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="text-left min-w-0">
                    <p className="text-sm font-bold text-tinta truncate">{e.empresa_nome}</p>
                    <p className="text-xs text-apoio">{e.lancamentos.length} lançamento(s)</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-tinta">{formatarMoeda(e.total)}</span>
                    {aberta ? <ChevronUp size={18} className="text-apoio" /> : <ChevronDown size={18} className="text-apoio" />}
                  </div>
                </button>

                {aberta && (
                  <div className="px-4 pb-4 border-t border-linha pt-3 flex flex-col gap-3">
                    <div>
                      <h4 className="text-[10px] font-bold text-apoio uppercase tracking-wide mb-1">
                        Quantidade por item (pra fatura)
                      </h4>
                      <div className="divide-y divide-linha">
                        {e.por_item.map((ri) => {
                          const item = itens.find((i) => i.id === ri.item_id);
                          return (
                            <div key={ri.item_id} className="flex items-center justify-between py-1.5 text-sm">
                              <span className="text-tinta">
                                {ri.quantidade}x {item?.nome ?? "Item"}
                              </span>
                              <span className="font-semibold text-tinta">{formatarMoeda(ri.total)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-apoio uppercase tracking-wide mb-1">
                        Lançamentos do período
                      </h4>
                      <div className="divide-y divide-linha">
                        {[...e.lancamentos]
                          .sort((a, b) => a.data.localeCompare(b.data))
                          .map((l) => {
                            const item = itens.find((i) => i.id === l.item_id);
                            return (
                              <div key={l.id} className="flex items-center justify-between py-2 text-sm">
                                <span className="text-tinta">
                                  {formatarDataCurta(l.data)} · {l.quantidade}x {item?.nome ?? "Item"}
                                </span>
                                <span className="font-semibold text-tinta">
                                  {formatarMoeda(l.quantidade * l.valor_unitario)}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
