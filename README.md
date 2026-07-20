# Dona Maria — Fechamento Diário

Sistema web mobile-first para digitalizar o "Relatório Diário" do Restaurante
Dona Maria: lançamentos de venda por item, canal e forma de pagamento,
controle de fiados e fechamento de caixa do dia.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS. Persistência em `localStorage`
do navegador — sem backend, sem login (uso único).

## Como rodar

```bash
npm install
npm run dev
# abra http://localhost:5173
```

```bash
npm run build     # build de produção em dist/
npm run preview   # servir o build localmente
```

## Estrutura

```
src/
├── lib/
│   ├── types.ts        modelo de dados (Item, Lançamento, DiaStatus, FechamentoDia)
│   ├── itens.ts         cardápio fixo pré-cadastrado (22 itens do papel)
│   ├── storage.ts       persistência em localStorage + seed inicial de exemplo
│   ├── calculos.ts       cálculo do fechamento do dia
│   ├── rotulos.ts        rótulos em português de canal/forma de pagamento
│   ├── format.ts         formatação de moeda e data
│   └── exemplo.ts        dados de demonstração (1º acesso)
├── contexts/
│   └── DadosContext.tsx  estado global + mutações (criar/editar/excluir lançamento, fiado, fechamento)
├── components/
│   ├── BottomNav.tsx
│   ├── SeletorData.tsx
│   ├── ModalLancamento.tsx
│   └── ModalQuitarFiado.tsx
└── pages/
    ├── Lancamentos.tsx   lançamento do dia (itens fixos + lista editável)
    ├── Fechamento.tsx    totais, conferência de caixa, fechar/reabrir o dia
    ├── Fiados.tsx         fiados em aberto + quitação
    └── Historico.tsx      dias fechados + detalhamento
```

## Regras de negócio

- Fiado nunca soma em "forma de pagamento" até ser quitado.
- Fiados quitados entram no fechamento do dia da **quitação**, não da venda.
- A diferença de caixa considera só a parte em dinheiro (pix e cartão não têm
  contagem física).
- Um dia fechado trava novos lançamentos/edições até ser reaberto (com
  confirmação).

## Dados de exemplo

No primeiro acesso o app carrega alguns lançamentos de exemplo (vendas de
hoje, um fiado em aberto de ontem, um fiado de dias atrás quitado hoje, e um
dia anterior já fechado) só para demonstrar o fluxo completo. Para começar do
zero, limpe o `localStorage` do site.
