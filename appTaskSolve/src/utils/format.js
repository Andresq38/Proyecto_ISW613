// Utilidades de formato local para fechas/moneda en español

export function formatDateTime(value, locale = 'es-CR', options) {
  try {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const fmt = new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      ...options,
    });
    return fmt.format(date);
  } catch {
    return String(value);
  }
}

export function formatDate(value, locale = 'es-CR', options) {
  try {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const fmt = new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      ...options,
    });
    return fmt.format(date);
  } catch {
    return String(value);
  }
}

export function formatMoney(value, locale = 'es-CR', currency = 'CRC') {
  try {
    if (value == null || value === '') return '';
    const num = Number(value);
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num);
  } catch {
    return String(value);
  }
}
