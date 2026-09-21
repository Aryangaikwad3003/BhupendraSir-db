const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Prod data'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

const headerRow = json[1]; // assuming row 1 is the header row
for (let i = 40; i <= 60; i++) {
  console.log(`[${i}] ${headerRow[i]}`);
}
