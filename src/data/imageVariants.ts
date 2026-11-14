export interface ImageVariant {
  sm: string;
  lg: string;
  smWidth: number;
  lgWidth: number;
  width: number;
  height: number;
}

const webpModules = import.meta.glob('../assets/images/optimized/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const variantByKey = new Map<string, ImageVariant>();

const pairMap = new Map<string, { sm?: string; lg?: string }>();
for (const [path, url] of Object.entries(webpModules)) {
  const match = path.match(/\/([^/]+)-(sm|lg)\.webp$/i);
  if (!match) continue;
  const [, baseKey, size] = match;
  const entry = pairMap.get(baseKey) ?? {};
  if (size === 'sm') entry.sm = url;
  else entry.lg = url;
  pairMap.set(baseKey, entry);
}

for (const [baseKey, entry] of pairMap.entries()) {
  if (!entry.sm || !entry.lg) continue;
  const isHero = baseKey.includes('hero');
  variantByKey.set(baseKey, {
    sm: entry.sm,
    lg: entry.lg,
    smWidth: 480,
    lgWidth: 960,
    width: 960,
    height: isHero ? 536 : 717,
  });
}

export function getImageVariant(src?: string): ImageVariant | undefined {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return undefined;
  const match = src.match(/\/([a-z0-9_]+_[0-9]{8,})(?:-[A-Za-z0-9_-]+)?\.(?:jpg|jpeg|png|webp)/i);
  if (!match) return undefined;
  return variantByKey.get(match[1]);
}
