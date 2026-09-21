const XLSX = require('xlsx');

const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Product Master'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

let stockLevels = 0;
let errors = 0;
for (let i = 0; i < Math.min(json.length, 50); i++) {
  const row = json[i];
  const stockLevel = row[23]; // Column X is 23
  console.log(`Row ${i}: Product: ${row[5]}, Stock: ${stockLevel}`);
  if (typeof stockLevel === 'number') stockLevels++;
  if (typeof stockLevel === 'string' && stockLevel.includes('#')) errors++;
}
console.log(`Total rows checked: 50. valid numbers: ${stockLevels}, errors: ${errors}`);
