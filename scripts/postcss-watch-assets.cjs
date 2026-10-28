const manifest = require('../src/config/assets.json');

module.exports = function watchAssets() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_WATCH_ASSET_BASE_URL || manifest.baseUrl
  ).replace(/\/$/, '');
  return {
    postcssPlugin: 'watch-assets',
    Declaration(declaration) {
      declaration.value = declaration.value.replace(
        /url\(\s*['"]?watch-asset:([^)'"\s]+)['"]?\s*\)/g,
        (_, name) => {
          if (!Object.prototype.hasOwnProperty.call(manifest.files, name)) {
            throw declaration.error(`Unknown Watch asset: ${name}`);
          }
          return `url("${baseUrl}/${name.split('/').map(encodeURIComponent).join('/')}?v=${manifest.release}")`;
        },
      );
    },
  };
};
module.exports.postcss = true;
