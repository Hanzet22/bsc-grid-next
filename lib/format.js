export function fmtPrice(v) {
  if (v == null) return '--';
  if (v < 0.01) return '$' + v.toFixed(8);
  if (v < 1) return '$' + v.toFixed(5);
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function fmtCompact(v) {
  if (v == null) return '--';
  return '$' + Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v);
}

export function fmtChg(v) {
  if (v == null) return '--';
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
}
