const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true });
const ws = workbook.Sheets['Product machine Summary'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

for (let i = 87; i < 110; i++) {
  if (json[i]) {
    console.log(`Row ${i}: ${JSON.stringify(json[i])}`);
  }
}
