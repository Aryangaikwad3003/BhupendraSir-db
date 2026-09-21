const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true });
const ws = workbook.Sheets['Product Master'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });
console.log('Headers in row 5:');
json[5].forEach((col, idx) => {
  if (col) console.log(`[${idx}] ${col}`);
});
