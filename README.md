# Folio — hybrid review slice

Personal portfolio of Lucas Neukirchen, independent consumer of MOBS. First slice: bilingual editorial Home and cases MOBS, Odisseus, The Last Sentinel. Published as a static bilingual website. No playable experience is implied.

## Sources and responsibility

- `source/content.json`: consumer-owned facts, copy, pinned evidence links and locale equivalents.
- `source/presentation.json`: personal identity tokens, patterns, scope and asset provenance.
- `source/specs/`: WES-compatible specifications materialized from those sources. Generator requires approved status; the recorded approval refers to the execution mandate for this slice, not final visual or release approval.
- MOBS owns its generic authorities, schemas, Generator and Validator. Folio owns navigation, language equivalence, evidence UI, release snapshots and personal visual layer.
- `preview-pure/`: unmodified WES output for this slice; `pure/` remains the previous version.
- WES diagnostics and full technical provenance: external private audit directory supplied with `--evidence-file`. Final consumer pages require separate checks.

## Reproduce

Use an existing Node 24 installation and a MOBS checkout at `009feb3558df7919070971656411f6c0a58cf8cf`, with its existing compiled runtime and dependencies. No installation/build inside MOBS is performed.

```powershell
node scripts/build.mjs --mobs-root C:\AI\projects\missao-mobs --runtime-root C:\AI\lab\folio-hybrid-v1\wes-runtime --evidence-file C:\AI\lab\folio-hybrid-v1\private-evidence.json
node tests/validate.mjs --evidence-file C:\AI\lab\folio-hybrid-v1\private-evidence.json --legacy-root C:\AI\lab\folio-previous-09d3263\baseline-full
node scripts/serve.mjs
```

The execution copy is required because current WES reads specification/configuration paths relative to its repository root. The script copies compiled files and schemas unchanged, verifies relevant hashes, and reads existing dependencies through a local junction. It never writes MOBS. Structural WES Theme/Policy generate the pure output; consumer presentation tokens style the final pages. No WES extension or new institutional authority is introduced.

The current `narrative-chain` renderer emits numeric trait levels not grounded in this content pack. This slice uses `stacked-default` for those passages instead. `manifesto-list` retains its existing WES interaction script; the consumer adds a no-JavaScript text fallback. These are consumer choices, not a change to MOBS patterns.

Open the printed local URL. Stop the preview with Ctrl+C.

## Preserved version

The previous active version and historical releases are preserved locally outside the repository at `C:\AI\lab\folio-previous-09d3263\baseline-full`, with a complete `baseline-09d3263.zip` archive. All 55 historical files are verified against `source/legacy-manifest.json`. They are excluded from the current published tree; existing Git history is retained.

## Explicit limits

The Last Sentinel uses only the Toxic City arena whose bytes match the pinned remote blob. Divergent local HD character/fog assets are excluded. The final slice contains a static preview, not a web export or playable game. Artwork exclusivity and public redistribution clearance are not asserted. Review asset rights before publication. New role, commercial result, metric or competence rating is not inferred.

Baseline implementation states are documentary evidence, not universal operational validation. TEB blocker and other limitations remain explicit. The visitor sees curated evidence summaries and visuals; internal repository links/baselines are kept outside this checkout. LinkedIn remains the primary contact. EN/PT-BR have identical page/source structure.

## Public/private boundary

Only `public/` is deployed by `.github/workflows/pages.yml`, after an exact payload validation. The local preview also serves only that directory. Source files and private audit records are not part of the website. Historical versions remain in existing Git history; removing them from the current tree does not make formerly public records confidential.

## Internal evidence pages

`source/evidence-public.json` contains curated verbatim excerpts, bilingual explanations, limitations and selected images. Nine captures show locally rendered excerpts retrieved from verified source versions; they are explicitly not GitHub UI screenshots or running-application screenshots. The tenth visual is the existing verified Toxic City asset. Claims and evidence lists link to EN/PT-BR pages inside Folio, not to repositories.

`scripts/prepare-evidence.mjs <external evidence-capture directory>` extracts the selected ranges from authenticated source copies held outside the checkout. Captures are created through browser screenshot tooling and visually reviewed; build does not fabricate or regenerate screenshots. The private manifest retains full sources, line ranges and hashes. `scripts/build-evidence.mjs` assembles the consumer pages and is called by the normal build. Original source language is retained; explanations and navigation are localized.

This evidence demonstrates the stated, bounded source behavior. It does not independently verify employment, exclusive authorship, commercial outcomes or universal operational safety. Public excerpts are a deliberate disclosure of selected material, not access to the repositories.
