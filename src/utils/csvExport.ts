
export function convertToCSV(data: any[], headers: { key: string; label: string }[]) {
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  const rows = data.map(item => {
    return headers.map(h => {
      const keys = h.key.split('.');
      let value: any = item;
      for (const key of keys) {
        value = value?.[key];
      }
      if (value === null || value === undefined) value = '';
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  return [headerRow, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, fileName: string) {
  // Add BOM for Excel compatibility with UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
