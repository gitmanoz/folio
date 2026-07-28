# Lucas Professional Experience — versão-final-v1

| Field | Value |
|---|---|
| **Release id** | `versao-final-v1` |
| **Date** | 2026-07-27 |
| **Status** | First final consumer-facing RI cut |
| **Validate** | EN + PT-BR `pass` (spec-and-artifact) |
| **Layout mode** | WES catalog-full compositions + RI chrome-only |

## Open

- Live working copy: `MOBS_WORKSPACE/mobs/artifacts/lucas-professional-experience/index.html`
- Frozen snapshot: `MOBS_WORKSPACE/mobs/artifacts/lucas-professional-experience/releases/versao-final-v1/index.html`

## Included in this cut

1. **Full-bleed shell** — `main` sem `max-width` de ~1400px; faixas light/ink ocupam a largura do monitor.
2. **Dual-surface chapters** — `data-surface="light"` (#e8ecf0) vs `data-surface="ink"` (#0c1216) nos padrões do Generator (hero, case, how, connect = ink; demais = light).
3. **Connect close** — slogan `Build Once. Create Forever.` em branco; rodapé `Built with MOBS` (EN/PT).
4. **PT-BR principles** — bullets de `f-principles` traduzidos (não mais inglês residual).
5. **Chrome-only postprocess** — lang switch + progress + LinkedIn CTA; sem `ri.css` brigando com a grid.

## Surface map (v1)

| Frame | Pattern | Surface |
|---|---|---|
| f-hero | banner-hero-split | ink |
| f-philosophy | asymmetric-blocks | light |
| f-profile | narrative-chain | light |
| f-timeline | timeline-horizontal | light |
| f-mobs-case | statement-orbit | ink |
| f-mobs-state | weighted-blocks | light |
| f-how | banner-carousel | ink |
| f-caps | type-mosaic | light |
| f-principles | manifesto-list | light |
| f-connect | final-cta | ink |

## Provenance

- Specs: `docs/mobs/foundation/reference-implementations/lucas-professional-experience/experience.{en,pt-BR}.json`
- Generator CSS/JS: `project/automation/src/narrative/web-experience-compositions.ts`
- Fingerprints (generate): see `releases/versao-final-v1/ri/postprocess-report.json` + diagnostics

## Non-goals for v1

- Não é autoridade de plataforma além da RI.
- Não inclui `ri.css` full morph.
- Texto analítico deste MD não substitui o Pack / Creative Mandate oficiais.
