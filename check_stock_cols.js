const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Product Master'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

for (let i = 6; i < 15; i++) {
  const row = json[i];
  console.log(`Row ${i}:`);
  for(let j=20; j<=26; j++){
    console.log(`  Col ${j}: ${row[j]}`);
  }
}
