# TODO

Live backlog. Remove items when done — this is not a changelog.

## Now

- [ ] Recriar o workspace pnpm em `application/` (packages/* + demos/*) do zero
- [ ] Validar viabilidade técnica do TypeScript Language Service rodando no browser antes de comprometer o marco M5 (adapter `types`) — maior risco técnico do PRD (RK-02)

## Next

- [ ] Implementar `shared` — schema de eventos + event bus (todo o resto depende disso)
- [ ] Implementar `dom-events` e `network` — maior precedente técnico do projeto anterior (fiber hooks, network-hook.ts)

## Later / ideas

- [ ] Implementar `state` — adapters React state / Redux / TanStack, um adapter por lib
- [ ] Implementar `console` — interceptação de console.* (só captura, sem replay)
- [ ] Implementar `types` — diagnostics do TS Language Service (bloqueado até a validação de viabilidade acima)
- [ ] Implementar painel `devtools` unificando os 5 domínios com timeline scrubber
- [ ] Definir paleta de cores e tipografia definitivas do painel (docs/DESIGN.md tem vários tokens marcados "a definir")

## Known issues
