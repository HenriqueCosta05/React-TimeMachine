# Design Spec — React Debug Machine (painel `devtools`)

Tokens concretos e regras de componente para o painel
(`@henriquecosta/react-debug-machine-devtools`, componente `DebugMachineDevtools` /
hook `useDebugMachine`). Valores marcados `a definir` precisam de decisão
antes da implementação — este documento não deve ficar com placeholder
permanente uma vez que o painel comece a ser construído.

## Brand

- Nome: React Debug Machine
- Tom: denso (mostra muita informação por área de tela sem esconder dados),
  preciso (nunca arredonda/omite valor capturado — o dev está debugando,
  precisão > estética), discreto (toggle fixo, não invasivo até ser aberto).

## Color tokens

| Token | Value | Usage |
|---|---|---|
| `color-bg` | #0F3040 | Fundo do painel |
| `color-primary` | #464858 | Destaque de seleção na timeline, botão de toggle |
| `color-secondary` | #A56F63 | Elementos secundários (bordas, divisores) |
| `color-error` | #ff5656 | Diagnósticos de tipo com erro, requisições com falha |
| `color-warn` | #ff8a6d | Diagnósticos de tipo com aviso, logs `console.warn` |
| `color-diff-add` | #78B9B5 | Valor adicionado num diff de estado |
| `color-diff-remove` | #AE445A | Valor removido num diff de estado |

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading | Source Sans Pro | 36px | 900 |
| Body / dados densos (listas, JSON, diffs) | Source Sans Pro | 14px | 500 |