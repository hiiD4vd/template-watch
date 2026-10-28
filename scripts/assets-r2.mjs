import fs from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { createHash, createHmac } from 'node:crypto';

// Credentials are read only by this administration script, never by Next.js.
const [command, ...args] = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
};
const manifestPath = path.resolve('src/config/assets.json');
const checksum = (data) => createHash('sha256').update(data).digest('hex');
const encode = (value) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
const mimeTypes = {
  '.glb': 'model/gltf-binary',
  '.exr': 'image/x-exr',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};
const request = (url, options = {}) =>
  fetch(url, {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(90000),
  });
async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(path.join(directory, prefix), {
    withFileTypes: true,
  })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(directory, relative)));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported entry: ${relative}`);
  }
  return files.sort();
}
async function pool(items, action) {
  let index = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (index < items.length) {
        const item = items[index++];
        await action(item);
      }
    }),
  );
}
async function configuration() {
  const envFile = option('--env');
  if (!envFile) throw new Error('Pass --env /absolute/path/to/private.env');
  const env = parseEnv(await fs.readFile(envFile, 'utf8'));
  for (const key of [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_MEDIA_BUCKET',
    'NEXT_PUBLIC_MEDIA_CDN_URL',
  ])
    if (!env[key]) throw new Error(`Missing ${key}`);
  return env;
}
function signer(env) {
  return async function signed(
    method,
    key = '',
    query = '',
    body,
    extraHeaders = {},
  ) {
    const host = `${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const pathname =
      '/' +
      [env.R2_MEDIA_BUCKET, ...(key ? key.split('/') : [])]
        .map(encode)
        .join('/');
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const day = timestamp.slice(0, 8),
      scope = `${day}/auto/s3/aws4_request`;
    const headers = {
      host,
      'x-amz-content-sha256': checksum(body || ''),
      'x-amz-date': timestamp,
      ...extraHeaders,
    };
    const names = Object.keys(headers).sort();
    const canonical = [
      method,
      pathname,
      query,
      names.map((name) => `${name}:${headers[name].trim()}\n`).join(''),
      names.join(';'),
      headers['x-amz-content-sha256'],
    ].join('\n');
    const hmac = (key, value) =>
      createHmac('sha256', key).update(value).digest();
    const signingKey = hmac(
      hmac(hmac(hmac('AWS4' + env.R2_SECRET_ACCESS_KEY, day), 'auto'), 's3'),
      'aws4_request',
    );
    const signature = createHmac('sha256', signingKey)
      .update(
        `AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${checksum(canonical)}`,
      )
      .digest('hex');
    headers.authorization = `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`;
    return request(`https://${host}${pathname}${query ? '?' + query : ''}`, {
      method,
      headers,
      ...(body ? { body } : {}),
    });
  };
}
async function requireOk(response, operation) {
  if (!response.ok) {
    const code =
      (await response.text()).match(/<Code>([^<]*)<\/Code>/)?.[1] || '';
    throw new Error(`${operation}: HTTP ${response.status} ${code}`);
  }
}
async function verify(manifest) {
  let verified = 0;
  const corsFailures = [];
  await pool(Object.entries(manifest.files), async ([name, metadata]) => {
    const response = await request(
      `${manifest.baseUrl}/${name.split('/').map(encode).join('/')}?v=${encode(manifest.release)}`,
      { headers: { Origin: 'http://localhost:3000' } },
    );
    await requireOk(response, `Verify ${name}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length !== metadata.bytes || checksum(bytes) !== metadata.sha256)
      throw new Error(`Checksum mismatch: ${name}`);
    const origin = response.headers.get('access-control-allow-origin');
    if (origin !== '*' && origin !== 'http://localhost:3000')
      corsFailures.push(name);
    const contentType = response.headers.get('content-type')?.split(';')[0];
    if (contentType !== metadata.contentType)
      throw new Error(`Incorrect Content-Type: ${name}`);
    verified++;
  });
  console.log(
    JSON.stringify({
      verified,
      bytes: manifest.totalBytes,
      checks: ['CDN download', 'SHA-256', 'Content-Type'],
      corsPassed: verified - corsFailures.length,
      corsFailures,
    }),
  );
  return corsFailures.length === 0;
}
try {
  if (command === 'verify') {
    if (
      !(await verify(
        JSON.parse(
          await fs.readFile(option('--manifest') || manifestPath, 'utf8'),
        ),
      ))
    )
      process.exitCode = 1;
  } else if (command === 'inspect') {
    const env = await configuration();
    const response = await signer(env)('GET', '', 'cors=');
    console.log(
      JSON.stringify({
        bucket: env.R2_MEDIA_BUCKET,
        http: response.status,
        cors: response.ok ? await response.text() : undefined,
      }),
    );
    const listing = await signer(env)('GET', '', 'list-type=2&max-keys=1');
    await requireOk(listing, 'Read sample key');
    const key = (await listing.text())
      .match(/<Key>([^<]*)<\/Key>/)?.[1]
      ?.replace(/&amp;/g, '&');
    if (key) {
      const sample = await request(
        `${env.NEXT_PUBLIC_MEDIA_CDN_URL}/${key.split('/').map(encode).join('/')}`,
        { method: 'HEAD', headers: { Origin: 'http://localhost:3000' } },
      );
      console.log(
        JSON.stringify({
          sampleHttp: sample.status,
          allowOrigin: sample.headers.get('access-control-allow-origin'),
        }),
      );
    }
  } else if (command === 'upload') {
    const source = option('--source');
    if (!source)
      throw new Error('Pass --source /absolute/path/to/organized-assets');
    const env = await configuration(),
      signed = signer(env);
    const files = {};
    for (const name of await walk(source)) {
      if (!/^[a-zA-Z0-9_./-]+$/.test(name) || name.includes('..'))
        throw new Error(`Invalid asset path: ${name}`);
      const contentType = mimeTypes[path.extname(name)];
      if (!contentType) throw new Error(`Unsupported asset: ${name}`);
      const data = await fs.readFile(path.join(source, name));
      files[name] = { bytes: data.length, sha256: checksum(data), contentType };
    }
    if (!Object.keys(files).length) throw new Error('No assets found');
    const release = checksum(JSON.stringify(files)).slice(0, 16);
    const prefix = `templates/watch/releases/${release}`;
    const manifest = {
      schemaVersion: 1,
      project: 'watch',
      release,
      prefix,
      baseUrl: `${env.NEXT_PUBLIC_MEDIA_CDN_URL.replace(/\/$/, '')}/${prefix}`,
      totalBytes: Object.values(files).reduce(
        (total, file) => total + file.bytes,
        0,
      ),
      files,
    };
    console.log(
      JSON.stringify({
        bucket: env.R2_MEDIA_BUCKET,
        prefix,
        files: Object.keys(files).length,
        bytes: manifest.totalBytes,
      }),
    );
    let uploaded = 0,
      existing = 0;
    await pool(Object.entries(files), async ([name, metadata]) => {
      const key = `${prefix}/${name}`;
      const head = await signed('HEAD', key);
      if (head.ok) {
        if (head.headers.get('x-amz-meta-sha256') !== metadata.sha256)
          throw new Error(`Existing object differs: ${name}`);
        existing++;
        return;
      }
      if (head.status !== 404) await requireOk(head, `Check ${name}`);
      const body = await fs.readFile(path.join(source, name));
      const response = await signed('PUT', key, '', body, {
        'content-type': metadata.contentType,
        'cache-control': 'public, max-age=31536000, immutable',
        'x-amz-meta-sha256': metadata.sha256,
        'if-none-match': '*',
      });
      await requireOk(response, `Upload ${name}`);
      uploaded++;
    });
    console.log(JSON.stringify({ uploaded, existing }));
    const corsReady = await verify(manifest);
    const body = Buffer.from(JSON.stringify(manifest, null, 2) + '\n');
    const remote = await signed('PUT', `${prefix}/manifest.json`, '', body, {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-amz-meta-sha256': checksum(body),
    });
    await requireOk(remote, 'Upload manifest');
    await fs.mkdir('artifacts', { recursive: true });
    await fs.writeFile(
      corsReady ? manifestPath : 'artifacts/r2-pending-manifest.json',
      body,
    );
    console.log(
      corsReady
        ? 'Verified release manifest saved to src/config/assets.json'
        : 'All checksums verified; pending manifest saved in artifacts until CORS is configured.',
    );
    if (!corsReady) process.exitCode = 1;
  } else {
    throw new Error(
      'Usage: assets-r2.mjs inspect --env FILE | upload --env FILE --source DIR | verify',
    );
  }
} catch (error) {
  console.error(error.cause?.code || error.message);
  process.exitCode = 1;
}
