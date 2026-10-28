# Watch experience

Interactive watch presentation built with Next.js, React, Three.js and GSAP. The homepage renders React components directly; it no longer redirects to a saved HTML page or loads the former application bundles.

For AI-assisted reproduction of this exact project, start with [AI_START_HERE.md](AI_START_HERE.md).

## Run locally

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000. Fonts, photographs, the watch model and environment maps load from Cloudflare R2 through `cdn.promptedsite.com`. WebGL and network access to the CDN are required for the watch rendering.

## Edit the project

- `src/components/sections/`: the 14 page sections and presentation controls, written in React/TypeScript.
- `src/config/content.json`: visible copy and labels.
- `src/config/materials.json`: watch finishes and material settings.
- `src/styles/`: original style rules and cascade order, with readable scope names.
- `src/runtime/engine.js`: rendering, asset loading, events and frame scheduling.
- `src/runtime/watch/`: camera, scene, scroll choreography and interactions, separated by responsibility.
- `src/runtime/start.js`: React initialization and teardown, including animation, observer and GPU cleanup.
- `src/shaders/`: GLSL shader source.
- `src/config/assets.json`: public R2 release manifest, asset paths and checksums.
- `src/lib/assets.ts`: shared CDN URL resolver.
- `docs/r2-assets.md`: asset structure, upload, verification and recovery instructions.

React components, content access, text splitting and shared configuration/math use TypeScript. The custom rendering engine remains readable JavaScript; this is not yet a fully typed engine. Original shaders, model geometry, CSS and animation choreography are retained to preserve the design.

`npm run customize` applies `template.config.json` to source content and materials. Run this only when intentionally changing the branding: the checked-in template settings differ from the original visible brand.

The source asset collection contains photography for the first finish only. Selecting another finish updates the 3D material and labels while retaining those photographs, instead of requesting nonexistent images.

## Validation

```sh
npm run typecheck
npm run lint
npm run build
```

With the development server running on port 3000:

```sh
npx playwright install chromium
npm test
npm run test:visual
```

`npm test` exercises desktop/mobile loading, four finish selections, press-and-hold, scrolling, section and part counts, horizontal overflow, JavaScript errors and failed HTTP responses. `WATCH_URL` selects a different server for this test.

The visual test compares 14 section frames at 1440×900 and 375×812 against the original commit `3abf07e1b830e3920a44f7e50a4fd4a963b56546`. Keep that commit available locally. Reference files are loaded from Git through Playwright request interception; they are not deployed with the application.

Both versions use the same browser, date, procedural noise/particle seeds and animation frame state, and refresh section measurements after fonts load. Pixelmatch uses threshold 0.1 without image masks. Screenshots, differences and measured scores are written to `artifacts/comparison/`. These are sampled visual regressions, not proof of identical output at every scroll position, animation time, browser or GPU. `WATCH_SECTIONS=Hands npm run test:visual` restricts captured sections during investigation.

Migration validation (28 October 2026): all 28 sampled frames passed the 98% minimum. Desktop scores ranged from 99.987–100%; mobile from 99.974–100%. Production interaction tests passed at both viewport sizes with no page errors or failed HTTP responses. Type checking, lint and production compilation also passed.

For a production build while the development server remains active, use a separate output directory:

```sh
NEXT_DIST_DIR=.next-build npm run build
NEXT_DIST_DIR=.next-build npm run start -- --port 3002
WATCH_URL=http://localhost:3002 npm test
```

## Migration history

The old HTML and generated application bundles were removed from the active project. They remain recoverable from the original Git commit; local migration backups were moved outside the repository to the owner's asset backup directory. No iframe or `dangerouslySetInnerHTML` is used to render the page. Third-party dependencies retain their own licenses and notices.
