const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Product Master'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

let stockLevels = {};
for (let i = 6; i < Math.min(json.length, 50); i++) {
  const row = json[i];
  const product = row[5];
  const stockLevel = row[24]; // Column Y is 24
  if (typeof stockLevel === 'number') {
    stockLevels[product] = (stockLevels[product] || 0) + stockLevel;
  }
}
console.log('Stock by product (first 50 rows, column 24):', stockLevels);
