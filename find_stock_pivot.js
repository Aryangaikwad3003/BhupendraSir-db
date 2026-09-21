const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Product machine Summary'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

for (let i = 0; i < json.length; i++) {
  const rowStr = JSON.stringify(json[i]);
  if (rowStr.includes('Stock le') || rowStr.includes('APMC')) {
    console.log(`Row ${i}: ${rowStr}`);
  }
}
