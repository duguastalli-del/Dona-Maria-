const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}

export function hojeISO(): string {
  const agora = new Date();
  const offset = agora.getTimezoneOffset();
  const local = new Date(agora.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export function somarDiasISO(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  d.setDate(d.getDate() + dias);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function primeiroDiaDoMesISO(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

export function formatarDataCurta(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function diaDaSemana(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const d = new Date(ano, mes - 1, dia);
  const nomes = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return nomes[d.getDay()];
}

export function formatarDataExtenso(data: string): string {
  return `${diaDaSemana(data)}, ${formatarDataCurta(data)}`;
}

export function formatarDataHora(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} às ${hh}:${min}`;
}
