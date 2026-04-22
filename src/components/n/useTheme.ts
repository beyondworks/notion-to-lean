'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('nm-dark') === '1';
    setDark(saved);
    document.documentElement.setAttribute('data-theme', saved ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem('nm-dark', next ? '1' : '0');
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const set = (value: boolean) => {
    setDark(value);
    localStorage.setItem('nm-dark', value ? '1' : '0');
    document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light');
  };

  return { dark, toggle, set };
}
