export interface ExportCsvRow {
  date: Date | string;
  description: string;
  status: string;        // "Pendente", "Pago", "Concluído"
  responsible: string;   // Nome do responsável / pessoa
  amount: number;
  isNegative?: boolean;
}

/**
 * Exporta uma lista de lançamentos para um arquivo CSV compatível diretamente com o Excel no Brasil.
 * Colunas geradas: Data, Descrição, Status, Responsável, Valor
 */
export function exportToExcelCsv(filename: string, items: ExportCsvRow[]) {
  // BOM (Byte Order Mark) para UTF-8 garante que acentos abram perfeitamente no Excel
  const BOM = '\uFEFF';
  const headers = ['Data', 'Descrição', 'Status', 'Responsável', 'Valor'];

  const rows = items.map(item => {
    // 1. Data formatada para dd/MM/yyyy
    let dateFormatted = '';
    if (item.date instanceof Date) {
      const d = String(item.date.getDate()).padStart(2, '0');
      const m = String(item.date.getMonth() + 1).padStart(2, '0');
      const y = item.date.getFullYear();
      dateFormatted = `${d}/${m}/${y}`;
    } else if (typeof item.date === 'string') {
      const datePart = item.date.split('T')[0];
      if (datePart.includes('-')) {
        const [y, m, d] = datePart.split('-');
        dateFormatted = `${d}/${m}/${y}`;
      } else {
        dateFormatted = item.date;
      }
    }

    // 2. Descrição tratada contra aspas e quebras
    const cleanDescription = `"${(item.description || '').replace(/"/g, '""').trim()}"`;

    // 3. Status tratado
    const cleanStatus = `"${(item.status || 'Pendente').replace(/"/g, '""').trim()}"`;

    // 4. Responsável tratado
    const cleanResponsible = `"${(item.responsible || 'Não informado').replace(/"/g, '""').trim()}"`;

    // 5. Valor (última coluna) no formato numérico padrão do Excel brasileiro (vírgula decimal)
    const numericValue = item.isNegative ? -Math.abs(item.amount) : Math.abs(item.amount);
    const formattedValue = numericValue.toFixed(2).replace('.', ',');
    const valueField = `"${formattedValue}"`;

    return [dateFormatted, cleanDescription, cleanStatus, cleanResponsible, valueField].join(';');
  });

  const csvContent = BOM + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
