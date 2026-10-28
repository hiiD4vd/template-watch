import {
  Color,
  PMREMGenerator,
  EquirectangularRefractionMapping,
  EquirectangularReflectionMapping,
  CubeUVReflectionMapping,
} from 'three';

export function debounce(callback, delay = 1, options = {}) {
  const leading = options.trail !== null ? !!options.trail : true;
  let timer,
    first = leading;
  return (...args) => {
    clearTimeout(timer);
    if (first) {
      first = false;
      callback.apply(options.bind || null, args);
    }
    timer = setTimeout(() => {
      if (leading) first = true;
      callback.apply(options.bind || null, args);
    }, delay);
  };
}
export function coerceMaterialOptions(options, types) {
  for (const [name, Type] of Object.entries(types)) {
    const value = options[name];
    if (value instanceof Type) continue;
    if (Array.isArray(value)) options[name] = new Type().fromArray(value);
    else if (typeof value === 'string' && Type === Color)
      options[name] = new Color(value);
  }
}
export function shaderSource(source, property) {
  return {
    use(material) {
      const target = material.material || material;
      target[property] = source;
      target.needsUpdate = true;
      return material;
    },
  };
}
export function shaderPatch(patch, property) {
  return {
    use(material) {
      const target = material.material || material;
      const blocks = patch.trim().split('/// #replace').slice(1);
      for (const block of blocks) {
        const [search, ...replacement] = block.trim().split('\n');
        target[property] = target[property].replace(
          search.trim(),
          replacement
            .map((line) => line.trim())
            .filter(Boolean)
            .join('\n'),
        );
      }
      target.needsUpdate = true;
      return material;
    },
  };
}
const environments = new Map();
export function environmentMap(renderer, texture, refraction = false) {
  const key = texture.uuid + refraction;
  if (environments.has(key)) return environments.get(key);
  texture.mapping = refraction
    ? EquirectangularRefractionMapping
    : EquirectangularReflectionMapping;
  const generator = new PMREMGenerator(renderer);
  generator.compileEquirectangularShader();
  const result = generator.fromEquirectangular(texture).texture;
  if (result.mapping !== CubeUVReflectionMapping) return null;
  const height = result.image.height,
    maxMip = Math.log2(height) - 2;
  result.userData = {
    ...result.userData,
    texelWidth: 1 / (3 * Math.max(2 ** maxMip, 112)),
    texelHeight: 1 / height,
    maxMip,
  };
  environments.set(key, result);
  texture.dispose();
  generator.dispose();
  return result;
}
export function applyMaterials(
  root,
  types,
  config = {},
  fallback = 'WatchMaterial',
  lowercase = false,
  prefix = '',
) {
  const cache = new Map();
  root.traverse((object) => {
    const material = object.material;
    if (
      !material ||
      (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial) ||
      material.userData?.keepStandard
    )
      return;
    const name =
      (prefix ? prefix + '-' : '') +
      (lowercase ? material.name.toLowerCase() : material.name);
    let type = material.name;
    for (const pattern of [
      ' ',
      '-',
      /[0-9]/g,
      '.',
      'first',
      'second',
      'third',
      'fourth',
    ])
      type = type.replaceAll(pattern, '');
    const Type = types[type] || types[fallback];
    if (!Type) throw new Error(`Unknown material ${type}`);
    const options = {
      ...material,
      ...config[type.replace('first', '')],
      ...config[name.replace('first', '')],
      name,
    };
    const key =
      name +
      !!object.instanceMatrix +
      object.isSkinnedMesh +
      [
        material.roughnessMap,
        material.aoMap,
        material.map,
        material.metalnessMap,
        material.normalMap,
        object.userData.ao,
      ]
        .map((texture) => texture?.uuid || '')
        .join('');
    if (!cache.has(key)) cache.set(key, new Type(options, object));
    object.material = cache.get(key);
    for (const [key, value] of Object.entries({
      ...object.material.userData,
      ...object.userData,
    })) {
      if (key === 'blending') {
        object.material.blending = value;
        object.material.depthWrite = false;
      }
      if (key === 'visible') object.material.visible = value !== 'false';
      if (key === 'renderOrder') object.renderOrder = ~~value;
    }
  });
}
