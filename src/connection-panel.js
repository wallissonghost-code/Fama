import { STORAGE_KEYS } from './config.js';

export function cleanCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function formatCode(value = '') {
  const code = cleanCode(value);
  return code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export function setupConnectionPanel({ onConnect }) {
  const input = document.getElementById('panelCode');
  const button = document.getElementById('connectPanel');
  const status = document.getElementById('panelStatus');

  const setStatus = (text, kind = '') => {
    if (!status) return;
    status.textContent = text;
    status.className = `connect-status ${kind}`.trim();
  };

  if (input) {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.panelCode);
      if (saved) input.value = formatCode(saved);
    } catch {}

    input.addEventListener('input', event => {
      event.target.value = formatCode(event.target.value);
    });
  }

  const connect = async () => {
    const code = cleanCode(input?.value);

    if (input) input.value = formatCode(code);
    if (code.length !== 8) {
      setStatus('Código inválido', 'err');
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.panelCode, formatCode(code));
    } catch {}

    return onConnect?.(code, setStatus);
  };

  button?.addEventListener('click', connect);
  input?.addEventListener('keydown', event => {
    if (event.key === 'Enter') connect();
  });

  return { setStatus, connect };
}
