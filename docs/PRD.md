# PRD — React Debug Machine

| Campo | Valor |
|---|---|
| **Status** | `Rascunho` |
| **Versão** | v0.1 |
| **Autor / Owner** | Henrique Costa |
| **Revisores** | — |
| **Última atualização** | 2026-07-23 |
| **Release alvo** | — |
| **Links rápidos** | [Repo](https://github.com/HenriqueCosta05/React-Debug-Machine) · [Design](../docs/DESIGN.md) · [Board](../TODO.md) · [Métricas](#) |

> Este é um documento vivo — atualize junto com as decisões, não depois.

---

## 1. O que o produto é

### 1.1 Resumo em uma frase
React Debug Machine é um debugger runtime unificado para apps React: correlaciona, num só painel, eventos de DOM, mudanças de estado (React, Redux, TanStack), logs de console, requisições/respostas de API e diagnósticos de tipagem TypeScript.

### 1.2 Problema
Hoje, debugar um app React exige alternar entre ferramentas isoladas que não se falam: React DevTools para a árvore de componentes, Redux DevTools (ou equivalente) para estado, a aba Network do navegador para requisições, o console para logs, e o editor/`tsc` para erros de tipo. Nenhuma delas responde à pergunta "esse erro de tipo veio de qual resposta de API, que atualizou qual estado, que renderizou qual componente, na hora de qual evento de DOM?" — a correlação entre as 5 camadas é feita manualmente, na cabeça do dev.

### 1.3 Público-alvo
| Persona | Contexto | Necessidade principal |
|---|---|---|
| Dev React em debug local | Investigando um bug num app rodando em dev | Ver, num só lugar, o que aconteceu antes/depois de uma ação — DOM, estado, rede, logs |
| Dev usando Redux/TanStack | App com estado gerenciado por lib de terceiros | Visibilidade cross-lib do estado antes/depois de uma mudança, sem abrir 2 devtools diferentes |

### 1.4 Proposta de solução
Uma camada de instrumentação client-side com um adapter por capacidade (DOM, estado, console, rede, tipos), alimentando um event bus/timeline compartilhado. Consumida via painel `devtools` batteries-included (com timeline scrubber e replay determinístico para DOM/estado/rede) ou via hook headless (`useDebugMachine`) para quem quiser construir UI própria.

### 1.5 Objetivos e métricas de sucesso
| Objetivo | Métrica | Baseline | Meta | Prazo |
|---|---|---|---|---|
| Adoção | Downloads npm/semana | 0 | a definir | 3 meses após 1ª release pública |
| Bundle enxuto | Tamanho por pacote (gzip) | — | `shared` < 5kB; cada adapter < 3kB | a cada release |
| Fricção de integração baixa | Linhas de código até o 1º evento capturado | — | ≤ 5 linhas | por adapter |
| Overhead de runtime aceitável | % adicionado ao tempo de frame com instrumentação ativa | — | a definir (validar com benchmark antes de fixar meta) | antes do v1.0 |

**Métricas de guarda (não podem piorar):**
- Tempo de frame do app hospedeiro com a instrumentação desligada (overhead deve ser ~0).

> Métricas propostas — não vieram do usuário, revisar/ajustar antes de aprovar o documento.

### 1.6 Não-objetivos
- Não é uma ferramenta de APM/monitoramento de produção (não é substituto de Sentry/Datadog).
- Não cobre frameworks fora do React (Vue, Svelte, etc.).
- Não cobre debug remoto ou em produção — uso é local, durante desenvolvimento.
- Não cobre mobile/React Native nesta fase.

### 1.7 Glossário
| Termo | Definição |
|---|---|
| Adapter | Módulo que captura (e, quando aplicável, repete) uma das 5 capacidades de debug |
| Event bus | Canal compartilhado onde os adapters publicam eventos capturados |
| Timeline / scrubber | Linha do tempo navegável que permite voltar a um ponto específico da sessão |
| Replay | Reprodução determinística de uma sequência de eventos capturados (DOM, estado, rede) |
| Fiber | Estrutura interna do React usada para introspecção de estado/componentes |
| Language Service | API do TypeScript usada para obter diagnósticos de tipo em tempo real |

---

## 2. Resumo de Changelog

| Versão | Data | Autor | Mudança | Motivo |
|---|---|---|---|---|
| v0.1 | 2026-07-23 | Henrique Costa | Criação do documento | Escopo inicial do projeto "React Debug Machine", reiniciado do zero |

**Convenção de versionamento**
- `v0.x` — rascunho, ainda em discussão
- `v1.0` — aprovado, escopo congelado para a release
- `v1.x` — ajustes durante a execução (registrar sempre o motivo)

---

## 3. Escopo

### 3.1 Dentro do escopo

| ID | Requisito | Prioridade | Critério de aceite |
|---|---|---|---|
| R-01 | O sistema deve detectar e permitir debug de eventos emitidos pelo DOM/React | `Must` | Dado um app instrumentado, quando um evento de DOM ocorre, então ele aparece na timeline com timestamp e alvo |
| R-02 | O sistema deve detectar e permitir debug de estado antes/depois de emissão, via React, Redux ou TanStack | `Must` | Dado um estado gerenciado por React/Redux/TanStack, quando o estado muda, então o painel mostra o valor antes e depois com diff |
| R-03 | O sistema deve detectar e permitir debug de logs de console emitidos pela aplicação hospedeira | `Must` | Dado um `console.log/warn/error` na app, quando ele é chamado, então aparece no painel sem suprimir o comportamento original do console |
| R-04 | O sistema deve detectar envio/recebimento de requisições e respostas de API como informação de debug | `Must` | Dado um `fetch`/`XMLHttpRequest`, quando a requisição é enviada e a resposta chega, então ambos aparecem correlacionados no painel |
| R-05 | O sistema deve expor diagnósticos de tipagem TypeScript (via Language Service) ligados ao componente/estado que os disparou | `Must` | Dado um erro/aviso de tipo reportado pelo TS Language Service, quando ele ocorre, então aparece no painel referenciando o componente/estado de origem |

> Todos os 5 requisitos vieram como escopo confirmado pelo usuário; reprioritize se algum precisar ser adiado.

### 3.2 User stories
- Como dev React, quero ver os eventos de DOM disparados para que eu entenda a sequência exata de interações que levou a um bug.
  - Aceite: evento aparece na timeline com tipo, alvo e timestamp.
- Como dev usando Redux/TanStack, quero ver o estado antes/depois de uma mudança para que eu entenda o efeito exato de uma action ou mutation.
  - Aceite: painel mostra diff estruturado do estado, com origem (React/Redux/TanStack) identificada.
- Como dev React, quero ver os logs de console dentro do mesmo painel de debug para que eu não precise alternar para o DevTools do navegador.
  - Aceite: log aparece no painel na mesma timeline dos demais eventos, preservando o log original no console do navegador.
- Como dev React, quero ver requisições e respostas de API correlacionadas ao estado/evento que as disparou para que eu entenda a causa raiz de um dado incorreto na tela.
  - Aceite: request e response aparecem juntos, com o evento/estado que motivou a chamada referenciado.
- Como dev React, quero ver diagnósticos de tipagem TypeScript ligados ao componente/estado de origem para que eu identifique rapidamente onde um valor não bate com o tipo declarado.
  - Aceite: diagnóstico aparece no painel com link para o componente/estado correspondente.

### 3.3 Requisitos não-funcionais
| Categoria | Requisito |
|---|---|
| Performance | Instrumentação deve ter overhead desprezível quando desabilitada; orçamento de overhead ativo a validar com benchmark |
| Segurança / privacidade | Nenhum dado capturado sai do navegador — tudo local/in-memory, sem telemetria externa |
| Acessibilidade | Painel `devtools` segue WCAG 2.1 AA (é UI de uso diário do dev) |
| Compatibilidade | React 18 e 19 (fiber shape difere entre versões); versões suportadas de Redux/TanStack a fixar por adapter |
| Observabilidade | N/A para o produto em si — o produto É a ferramenta de observabilidade |
| i18n / l10n | Não prioritário nesta fase — painel em inglês ou português, a decidir |

### 3.4 Fora do escopo
| Item | Por que está fora | Reconsiderar quando |
|---|---|---|
| Frameworks não-React (Vue, Svelte) | Fora da proposta de valor central | Se houver demanda validada de mercado |
| Debug remoto/produção | Aumenta superfície de segurança e complexidade | Se houver caso de uso claro pós-v1 |
| Mobile / React Native | Mecanismo de instrumentação (fiber, DOM) não se aplica diretamente | Após v1 estável no web |
| Record & replay fora do domínio React | Fora do escopo do produto | Não previsto |

### 3.5 Premissas e dependências
| Tipo | Item | Dono | Impacto se falhar |
|---|---|---|---|
| Premissa | React expõe internals de fiber suficientes para introspecção segura entre versões | Engenharia | Adapters de DOM/estado quebram em upgrades de React |
| Premissa | Redux e TanStack expõem stores/subscriptions públicas, sem exigir middleware específico | Engenharia | Adapter de estado não funciona sem configuração adicional do usuário |
| Dependência | TypeScript Language Service rodando no contexto do browser (viabilidade a validar) | Engenharia | R-05 pode não ser viável como especificado; maior risco técnico do escopo |

### 3.6 Entregas e marcos
| Marco | Entregável | Data alvo | Responsável |
|---|---|---|---|
| M1 | `shared` (schema de eventos + event bus) | a definir | Henrique Costa |
| M2 | Adapters `dom-events` e `network` (maior precedente técnico) | a definir | Henrique Costa |
| M3 | Adapter `state` (React + Redux + TanStack) | a definir | Henrique Costa |
| M4 | Adapter `console` | a definir | Henrique Costa |
| M5 | Adapter `types` (validar viabilidade do Language Service primeiro) | a definir | Henrique Costa |
| M6 | Painel `devtools` unificando os 5 domínios | a definir | Henrique Costa |

---

## 4. Riscos

| ID | Risco | Categoria | Probabilidade | Impacto | Mitigação | Plano B | Dono |
|---|---|---|---|---|---|---|---|
| RK-01 | Internals do fiber do React são não-documentados e podem mudar entre versões | Técnico | Média | Alto | Shims por versão de React; range de versões suportado explícito | Fixar compatibilidade a uma faixa conhecida de versões | Henrique Costa |
| RK-02 | Rodar o TS Language Service em runtime no browser pode ser inviável em custo/latência | Técnico | Média | Alto | Prova de conceito isolada antes de comprometer M5 | Redefinir R-05 como diagnóstico estático (build-time) em vez de runtime | Henrique Costa |
| RK-03 | 7 pacotes é superfície grande para uma primeira versão | Prazo / recurso | Alta | Médio | Fasear entregas por marco (M1–M6), não lançar tudo de uma vez | Cortar `types` do v1 se M5 não for viável a tempo | Henrique Costa |
| RK-04 | — | Legal / compliance | Baixa | Baixo | Dado que tudo roda local/in-memory, exposição é baixa | — | — |

**Questões em aberto**
| ID | Pergunta | Bloqueia? | Responsável | Prazo | Resposta / data |
|---|---|---|---|---|---|
| Q-01 | Qual scope npm definitivo para os pacotes renomeados? | Sim | Henrique Costa | antes do M1 | — |
| Q-02 | Metas concretas de overhead de runtime e bundle size | Não | Henrique Costa | antes do v1.0 | — |
| Q-03 | Viabilidade técnica do TS Language Service no browser | Sim (para R-05/M5) | Henrique Costa | antes do M5 | — |

**Trade-offs assumidos**
- Um pacote por feature em vez de um monólito — escolhido para permitir instalação seletiva (tree-shaking real); custo aceito: mais overhead de manutenção entre pacotes (versionamento, publish).

---

## 5. Referências

**Internas**
- Convenções: [docs/CONVENTIONS.md](CONVENTIONS.md)
- Design do painel: [docs/DESIGN.md](DESIGN.md)
- Backlog: [TODO.md](../TODO.md)

**Externas**
- React internals (fiber) — sem link fixo, documentação não-oficial da comunidade
- API pública do Redux e do TanStack Query/Store
- TypeScript Compiler API / Language Service

---

## Checklist antes de marcar como aprovado

- [ ] O problema está descrito com evidência, não com suposição
- [x] Todo objetivo tem uma métrica com valor alvo (metas ainda propostas, não confirmadas pelo usuário)
- [x] A lista de fora do escopo está preenchida
- [x] Todo requisito tem critério de aceite verificável
- [x] Requisitos não-funcionais foram considerados
- [x] Riscos têm mitigação e dono
- [x] Questões em aberto têm responsável e prazo (prazos ainda genéricos)
- [ ] Pelo menos um engenheiro revisou a viabilidade técnica (pendente — especialmente R-05)
- [x] Termos e siglas estão no glossário
- [x] Changelog atualizado e versão incrementada
