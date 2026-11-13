import { BilingualText, Language } from '../types/bazario';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatBDT(amount: number, lang: Language = 'en'): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString('en-IN');
  return lang === 'bn' ? `৳${toBanglaDigits(formatted)}` : `৳${formatted}`;
}

export function formatNum(num: number, lang: Language = 'en'): string {
  const formatted = num.toLocaleString('en-IN');
  return lang === 'bn' ? toBanglaDigits(formatted) : formatted;
}

export function getText(text: BilingualText, lang: Language): string {
  return lang === 'bn' ? text.bn : text.en;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
