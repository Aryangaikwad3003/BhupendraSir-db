const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true, cellFormulas: true });

workbook.SheetNames.forEach(sheetName => {
  const ws = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });
  for (let i = 0; i < json.length; i++) {
    const row = json[i];
    for (let j = 0; j < row.length; j++) {
      if (row[j] === 21624 || row[j] === 26055) {
        console.log(`Found ${row[j]} in sheet ${sheetName}, row ${i}, col ${j}`);
      }
    }
  }
});
