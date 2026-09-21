const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellNF: true, cellFormulas: true });
const ws = workbook.Sheets['Product Master'];

console.log("Column Y (Stock level kg(pcs)/Box) values:");
for (let i = 7; i <= 15; i++) {
  const cell = ws[XLSX.utils.encode_cell({ r: i - 1, c: 24 })]; // Y is 24
  if (cell) {
    console.log(`Row ${i}: v=${cell.v}, w=${cell.w}, f=${cell.f}, t=${cell.t}`);
  } else {
    console.log(`Row ${i}: empty cell`);
  }
}
