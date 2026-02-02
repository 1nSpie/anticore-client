import { useState, useEffect } from 'react';

const ADMIN_TOKEN_KEY = 'login_token';

interface CookieOptions {
  days?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class BrowserCookieUtils {
  static get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const targetCookie = cookies.find(cookie => cookie.startsWith(`${name}=`));

    if (!targetCookie) return null;

    return decodeURIComponent(targetCookie.substring(name.length + 1));
  }

  static set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    const isProd = process.env.NODE_ENV === 'production';
    const expires = new Date(
      Date.now() + (options.days || 1) * 24 * 60 * 60 * 1000
    ).toUTCString();
    
    const cookieOptions = [
      `expires=${expires}`,
      `path=${options.path || '/'}`,
      options.domain ? `domain=${options.domain}` : '',
      options.secure !== false && isProd ? 'Secure' : '',
      options.sameSite || (isProd ? 'none' : 'lax'),
    ].filter(Boolean).join('; ');

    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions}`;
  }

  static remove(name: string, options: { path?: string; domain?: string } = {}): void {
    if (typeof document === 'undefined') return;

    const cookieOptions = [
      'expires=Thu, 01 Jan 1970 00:00:00 GMT',
      `path=${options.path || '/'}`,
      options.domain ? `domain=${options.domain}` : '',
    ].filter(Boolean).join('; ');

    document.cookie = `${name}=; ${cookieOptions}`;
  }

  static exists(name: string): boolean {
    return this.get(name) !== null;
  }
}

export function useCookie(name: string) {
  const [value, setValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieValue = BrowserCookieUtils.get(name);
    setValue(cookieValue);
    setIsLoading(false);
  }, [name]);

  const setCookie = (newValue: string, options?: CookieOptions) => {
    BrowserCookieUtils.set(name, newValue, options);
    setValue(newValue);
  };

  const removeCookie = (options?: { path?: string; domain?: string }) => {
    BrowserCookieUtils.remove(name, options);
    setValue(null);
  };

  const exists = () => BrowserCookieUtils.exists(name);

  return {
    value,
    isLoading,
    setCookie,
    removeCookie,
    exists: exists(),
  };
}

export function useAdminAuth() {
  return useCookie(ADMIN_TOKEN_KEY);
}

export const cookieUtils = {
  get: BrowserCookieUtils.get,
  set: BrowserCookieUtils.set,
  remove: BrowserCookieUtils.remove,
  exists: BrowserCookieUtils.exists,
  ADMIN_TOKEN_KEY,
};