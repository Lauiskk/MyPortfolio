export type Theme = 'dark' | 'light';
const KEY = 'portfolio-theme';

export function getTheme(): Theme {
  return (document.documentElement.dataset.theme as Theme) ?? 'dark';
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#f4f6fb' : '#0a0e27');
  return theme;
}

export function toggleTheme() {
  return setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/**
 * Runs before paint, inlined in <head>, so a stored light theme never flashes
 * dark. Dark is the default regardless of `prefers-color-scheme`: the whole
 * design is built on the dark palette, and light is an opt-in via the toggle.
 * Kept as a string so it can be injected verbatim without a module round-trip.
 */
export const themeBootScript = `(function(){try{
var s=localStorage.getItem('${KEY}');
document.documentElement.dataset.theme=(s==='light'||s==='dark')?s:'dark';
}catch(e){document.documentElement.dataset.theme='dark';}})();`;
