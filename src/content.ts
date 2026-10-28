import siteContent from './config/content.json';

export const content = siteContent;

export function translate(path: string): string {
  let value: unknown = content;
  for (const key of path.split('.')) {
    if (typeof value !== 'object' || value === null || !(key in value))
      throw new Error(`Unknown content key: ${path}`);
    value = (value as Record<string, unknown>)[key];
  }
  if (typeof value !== 'string')
    throw new Error(`Content key is not text: ${path}`);
  return value;
}
