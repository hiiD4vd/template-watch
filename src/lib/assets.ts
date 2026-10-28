import manifest from '../config/assets.json';

/** Public CDN location only; R2 credentials never enter the application. */
export const assetBaseUrl = (
  process.env.NEXT_PUBLIC_WATCH_ASSET_BASE_URL || manifest.baseUrl
).replace(/\/$/, '');

export function assetUrl(name: string): string {
  if (!Object.prototype.hasOwnProperty.call(manifest.files, name)) {
    throw new Error(`Unknown Watch asset: ${name}`);
  }
  return `${assetBaseUrl}/${name.split('/').map(encodeURIComponent).join('/')}?v=${manifest.release}`;
}
