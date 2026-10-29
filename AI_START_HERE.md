# Reproduce this Watch website

Use this repository as the implementation, preserving its layout, behavior and responsive design. Read `README.md` and `docs/r2-assets.md` first.

1. Download the complete source at the commit supplied by the user. Preserve all files, including the lockfile and PostCSS configuration.
2. Run `npm ci`, then `npm run dev`. This is a Next.js application with React components and a custom Three.js/GSAP runtime. Do not convert it to a single HTML file or change frameworks.
3. Media loads directly from Cloudflare R2. Keep `src/config/assets.json`, `src/lib/assets.ts`, and `scripts/postcss-watch-assets.cjs` together. Preserve the version query parameter on asset URLs. No R2 or Supabase credentials are needed to run the website.
4. If an Artifact or sandbox cannot access the R2 CDN, download the checksum-verified media package from the [Artifact Preview Assets release](https://github.com/hiiD4vd/template-watch/releases/download/artifact-assets-62efcbe56037ab63/watch-assets-62efcbe56037ab63.zip). Verify its contents against the included `manifest.json`, publish the files using that environment's supported companion-file mechanism, and adapt only the preview asset resolver. Do not ask the user to upload this package manually.
5. Preserve the DOM hierarchy, CSS import order, fonts, GLSL shaders, materials, camera configuration, scroll choreography and interactions. Do not replace assets, simplify animation or redesign the page unless requested.
6. Do not run `npm run customize` unless the user explicitly requests rebranding; its template settings differ from the current visible content.
7. Check `npm run build`, `npm run typecheck`, and `npm run lint`. With the server running and Playwright Chromium installed, run `npm test`. `npm run assets:verify` checks the CDN media.
8. The optional `npm run test:visual` also requires Git history containing the original reference commit listed in the README. A source ZIP alone does not include this history.
9. Report which checks actually ran. If your environment cannot download the full repository, install dependencies, reach the CDN, or render WebGL, state the limitation rather than presenting an approximate recreation as an identical result.

Deliver the runnable project and a preview when supported. Keep media on R2 and credentials out of the frontend. JavaScript, TypeScript, JSX SVG components, CSS and GLSL are application source, not media files to remove.
