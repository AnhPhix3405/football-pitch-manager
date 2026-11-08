export function formatReportTimestamp(
  isoDateStr: string | null | undefined,
  locale = 'vi-VN',
): string {
  if (!isoDateStr) return '—';
  try {
    const date = new Date(isoDateStr);
    if (isNaN(date.getTime())) return isoDateStr;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return isoDateStr;
  }
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function formatLatency(ms?: number): string {
  if (ms === undefined || ms === null || isNaN(ms)) return '0 ms';
  return `${ms} ms`;
}

export function triggerBlobDownload(
  data: BlobPart,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
