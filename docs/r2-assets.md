# Watch assets on Cloudflare R2

Bucket: `media`. Public domain: `https://cdn.promptedsite.com`.

Each release lives in its own content-addressed directory:

```text
templates/watch/releases/62efcbe56037ab63/
  manifest.json
  models/watch.glb
  environments/{studio,metal-detail}.exr
  textures/{noise.png,particles-gradient.jpg}
  fonts/{inter,nekst,freight}/
  images/gallery/
  images/parts/
  branding/{favicon.png,favicon.ico,share-image.webp}
  archive/next-default-favicon.ico
  archive/samples/
```

The archive contains pre-existing sample media that the Watch page does not use. All 77 original media files are retained in R2. No application code, environment files or credentials are uploaded.

`src/config/assets.json` is the public manifest: release, base URL, asset paths, sizes, MIME types and SHA-256 checksums. It contains no file contents or secrets. `src/lib/assets.ts` resolves image and model URLs. CSS uses `watch-asset:fonts/...`; the PostCSS plugin resolves those paths to the same CDN release during compilation. A build fails if CSS references an unknown asset.

Application JavaScript, CSS, JSX icons and GLSL remain source code. They are compiled normally. Media is served directly by the CDN, without a Next.js media proxy. `/favicon.ico` redirects to the CDN icon.

For AI preview environments whose Content Security Policy blocks the R2 domain, the same verified release is available as a [GitHub Release asset](https://github.com/hiiD4vd/template-watch/releases/tag/artifact-assets-62efcbe56037ab63). This distribution copy is intended for companion files inside the preview environment. Production continues to use R2.

## Administration

Credentials remain outside this repository. Pass the private environment file explicitly to the upload script; Next.js does not load it.

```sh
npm run assets:upload -- \
  --env /absolute/path/to/private.env \
  --source /absolute/path/to/organized-assets
npm run assets:verify
```

The source directory must use the folder layout above, excluding `manifest.json`. Use a clean directory containing only media for the new release; do not include backups, screenshots or application files.

Required variables: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_MEDIA_BUCKET`, `NEXT_PUBLIC_MEDIA_CDN_URL`. Supabase credentials are not used by this project or upload script.

The uploader computes a release ID from the inventory, checks existing objects, and uploads missing files with `If-None-Match: *`. It will not replace a differing existing asset. Files use their correct MIME types and `Cache-Control: public, max-age=31536000, immutable`. The verification command downloads every file through the public CDN and checks bytes, checksums, MIME types and browser CORS. Changed files should be published as a new release, not overwritten in an immutable release.

`NEXT_PUBLIC_WATCH_ASSET_BASE_URL` can override the entire release URL at build time. The default in the manifest works without any environment file in this repository. An override must expose the same asset paths and bytes.

## Browser CORS

The public CDN must allow cross-origin GET requests for fonts, WebGL textures and models. In the `media` bucket's CORS settings, retain existing rules and add the rule in `r2-cors-rule.json`. This rule is for public media only and allows GET/HEAD, not uploads or credentialed browser requests.

Asset URLs include their immutable release ID as a cache-busting query parameter. This immediately separates a newly enabled CORS policy from an older cached response. A cache purge is therefore optional. See [Cloudflare's CORS documentation](https://developers.cloudflare.com/r2/buckets/cors/). `npm run assets:verify` checks actual browser asset URLs with an Origin header.

## Recovery

The external asset workspace preserves organized copies for future updates. Earlier tracked media remains recoverable from Git history; this migration does not rewrite history. The R2 manifest can also be used to download and verify any release.
