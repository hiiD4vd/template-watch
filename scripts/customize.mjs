import fs from 'node:fs/promises';

const config = JSON.parse(await fs.readFile('template.config.json', 'utf8'));
const content = JSON.parse(
  await fs.readFile('src/config/content.json', 'utf8'),
);
const materials = JSON.parse(
  await fs.readFile('src/config/materials.json', 'utf8'),
);
if (typeof config.brandName !== 'string' || !config.brandName.trim())
  throw new Error('brandName must be a non-empty string');
const oldBrand = content.brand;
function update(value) {
  if (typeof value === 'string')
    return value
      .replaceAll('promptedsite', config.brandName)
      .replaceAll(oldBrand.shortName, config.brandName)
      .replaceAll('prompted', config.brandName.toLowerCase());
  if (Array.isArray(value)) return value.map(update);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, update(item)]),
    );
  return value;
}
const result = update(content);
const words = config.brandName.toUpperCase().split(' ');
result.brand = {
  headline: [config.brandName, config.modelName]
    .filter(Boolean)
    .join(' ')
    .toUpperCase(),
  left: words[0],
  right:
    words.length > 1
      ? words.slice(1).join(' ')
      : config.brandNameRight || config.modelName?.split(' ')[0] || 'EDITION',
  shortName: config.brandName,
};
result.meta.title = `${config.brandName} - ${config.modelName || 'Automatic Watch'}`;
if (config.tagline) result.meta.description = config.tagline;
if (config.weight) result.weight = config.weight;
if (config.diameter)
  result.diameter = config.diameter.replace(/mm/i, '').trim();
const finishKeys = {
  silver: ['silver', ''],
  black: ['black', 'second'],
  gold: ['gold', 'third'],
  roseGold: ['rose', 'fourth'],
};
for (const [key, [label, prefix]] of Object.entries(finishKeys)) {
  const finish = config.materials?.[key];
  if (!finish) continue;
  if (finish.label) result.colors[label] = finish.label;
  for (const [suffix, color] of [
    ['metal-glossy-ext', finish.glossy],
    ['metal-brushed-ext', finish.brushed],
    ['single-metal-glossy', finish.glossy],
    ['single-metal-brushed', finish.brushed],
  ])
    if (color && materials[prefix + suffix])
      materials[prefix + suffix].color = color;
}
await fs.writeFile(
  'src/config/content.json',
  JSON.stringify(result, null, 2) + '\n',
);
await fs.writeFile(
  'src/config/materials.json',
  JSON.stringify(materials, null, 2) + '\n',
);
console.log(`Updated source content and materials for ${config.brandName}.`);
