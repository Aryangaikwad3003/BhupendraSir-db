const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Product Master'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

let sumCol20 = 0;
let sumCol15 = 0;
for (let i = 6; i < json.length; i++) {
  const row = json[i];
  if (typeof row[20] === 'number') sumCol20 += row[20];
  if (typeof row[15] === 'number') sumCol15 += row[15];
}
console.log(`Sum of Col 20: ${sumCol20}`);
console.log(`Sum of Col 15: ${sumCol15}`);
