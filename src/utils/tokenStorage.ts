const STORAGE_KEY = 'pixcel_github_token';
const CACHE_KEY = 'pixcel_cached_apps';

export const getGitHubToken = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

export const setGitHubToken = (token: string): void => {
  try {
    if (token.trim()) {
      localStorage.setItem(STORAGE_KEY, token.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // LocalStorage may fail in restricted environments
  }
};

export const getCachedApps = (): any | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCachedApps = (data: any): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
};
