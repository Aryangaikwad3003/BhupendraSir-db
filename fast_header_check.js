const XLSX = require('xlsx');
// read only Prod data
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { sheetStubs: true, sheets: ['Prod data'] });
const ws = workbook.Sheets['Prod data'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

for (let i = 0; i < 5; i++) {
  if (json[i] && json[i].includes('Date')) {
    console.log("Header row found at index:", i);
    const headerRow = json[i];
    for (let c = 40; c <= 65; c++) {
      console.log(`[${c}] ${headerRow[c]}`);
    }
    break;
  }
}
