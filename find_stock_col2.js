const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });
const ws = workbook.Sheets['Product Master'];
const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });

let sums = {};
for (let col = 10; col < 35; col++) {
  let sum = 0;
  let hasNumberString = false;
  for (let i = 6; i < json.length; i++) {
    const val = json[i][col];
    if (val !== null && val !== undefined && val !== '') {
       let num = Number(val);
       if (!isNaN(num)) {
         sum += num;
         if (typeof val === 'string') hasNumberString = true;
       }
    }
  }
  if (sum > 0) {
    console.log(`Col ${col} sum: ${sum} (had number strings: ${hasNumberString})`);
  }
}
