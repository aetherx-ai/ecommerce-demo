const STORAGE_VERSION = 'bazario_state_v1';

export function loadPersistedState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_VERSION}_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function savePersistedState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${STORAGE_VERSION}_${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota exceptions cleanly
  }
}

export function clearAllPersistedState(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_VERSION)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}
