const XLSX = require('xlsx');
const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { sheetStubs: true, sheets: ['Prod data'] });
const ws = workbook.Sheets['Prod data'];
const csv = XLSX.utils.sheet_to_csv(ws);
const lines = csv.split('\n');
console.log(lines[1]);
