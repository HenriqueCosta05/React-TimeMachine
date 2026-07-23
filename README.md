# react-debug-machine

> Debugger runtime unificado para React: eventos de DOM, estado, logs, rede e tipagem num só painel.

---

## Sumário

- [Sobre](#sobre)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Quick start](#quick-start)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Scripts disponíveis](#scripts-disponíveis)
- [Testes](#testes)
- [Documentação relacionada](#documentação-relacionada)
- [Licença](#licença)

---

## Sobre

React Debug Machine correlaciona, num só painel, o que hoje exige alternar
entre várias ferramentas: eventos de DOM, mudanças de estado (React, Redux,
TanStack), logs de console da aplicação hospedeira, requisições/respostas de
API e diagnósticos de tipagem TypeScript.

**Status:** em desenvolvimento — projeto reiniciado do zero (ver
[docs/CHANGELOG.md](docs/CHANGELOG.md)).

### Funcionalidades principais

- Detecção e debug de eventos emitidos pelo DOM/React.
- Detecção e debug de estado antes/depois de mudanças, via React, Redux ou TanStack.
- Detecção e debug de logs de console emitidos pela aplicação hospedeira.
- Detecção de envio/recebimento de requisições e respostas de API.
- Debug de tipagem via diagnósticos do TypeScript Language Service.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Linguagem | TypeScript | 5.x |
| Framework (peer) | React | 18.x / 19.x |
| Gerenciador de pacotes | pnpm | — |
| Testes | Vitest + Playwright | — |

> Decisões de arquitetura e o "porquê" de cada escolha ficam em
> [docs/CONVENTIONS.md](docs/CONVENTIONS.md).

---

## Pré-requisitos

- Node.js (versão a fixar quando o workspace for recriado)
- pnpm

Nenhum serviço externo é necessário — ferramenta 100% client-side.

---

## Quick start

> O workspace `application/` ainda não existe neste repositório (projeto
> reiniciado do zero — ver [TODO.md](TODO.md)). Os comandos abaixo refletem
> o fluxo planejado e passam a valer assim que o workspace for recriado.

```bash
# 1. Clonar
git clone <url-do-repositorio>
cd react-debug-machine

# 2. Instalar dependências
cd application
pnpm install

# 3. Rodar em modo desenvolvimento
pnpm dev
```

---

## Estrutura do projeto

```
docs/           PRD, convenções, design, changelog
scripts/        bootstrap e publish (build + dev / release)
application/    código-fonte (pacotes + apps de demonstração)
TODO.md         backlog ativo
```

Detalhes do layout de `application/` (pacotes por feature, apps de demo) em
[docs/CONVENTIONS.md §2.4](docs/CONVENTIONS.md).

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `pnpm dev` | sobe o app de demonstração com a instrumentação anexada |
| `pnpm build` | builda todos os pacotes |
| `pnpm test` | roda a suíte de testes de todos os pacotes |
| `pnpm typecheck` | typecheck de todos os pacotes |

---

## Testes

```bash
pnpm test
```

Vitest para lógica isolada de cada adapter; Playwright para cenários que
exigem um browser real (captura/replay ponta-a-ponta). Detalhes em
[docs/CONVENTIONS.md §2.5](docs/CONVENTIONS.md).

---

## Documentação relacionada

| Documento | Conteúdo |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Produto: escopo, requisitos, riscos |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Convenções de arquitetura e código |
| [docs/DESIGN.md](docs/DESIGN.md) | Identidade visual e specs do painel `devtools` |
| [TODO.md](TODO.md) | Backlog ativo |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Histórico de versões |

---

## Licença

A definir.

---

## Contato / mantenedores

- Henrique Costa — henrique.b.costa9090@gmail.com

---

<sub>Última revisão: 2026-07-23 · Mantenha este README em sincronia com o
código: mudanças em build, execução ou testes exigem atualização no mesmo PR.</sub>
