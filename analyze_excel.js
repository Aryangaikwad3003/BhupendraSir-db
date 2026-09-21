const XLSX = require('xlsx');

const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx');
console.log('Sheets:', workbook.SheetNames);

const sheetName = 'Product machine Summary';
if (workbook.SheetNames.includes(sheetName)) {
  const ws = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`Top 50 rows of "${sheetName}":`);
  for (let i = 0; i < Math.min(50, json.length); i++) {
    console.log(i, json[i]);
  }
} else {
  console.log('Sheet not found:', sheetName);
}
