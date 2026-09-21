const XLSX = require('xlsx');

const workbook = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx', { cellDates: true });

function findHeaderRow(ws, columnIdx, matchText, maxScan = 20) {
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });
  const target = matchText.trim().toLowerCase();
  for (let i = 0; i < Math.min(maxScan, raw.length); i++) {
    const cell = raw[i]?.[columnIdx];
    if (typeof cell === 'string' && cell.trim().toLowerCase() === target) return i;
  }
  return -1;
}

const pdWs = workbook.Sheets['Prod data'];
const pdHeaderRow = findHeaderRow(pdWs, 1, 'Date');
const pdRows = XLSX.utils.sheet_to_json(pdWs, { header: 1, range: pdHeaderRow + 1, defval: null });

let outputByMonth = {};

pdRows.forEach((r) => {
  const dateVal = r[1];
  const fgCode = r[14];
  const machine = r[3];
  
  if (!dateVal || !(dateVal instanceof Date)) return;
  if (!fgCode && !machine) return;
  
  const m = dateVal.getUTCMonth() + 1;
  const y = dateVal.getUTCFullYear();
  const monthKey = `${y}-${m.toString().padStart(2, '0')}`;
  
  const output = Number(r[11]);
  if (!isNaN(output)) {
    outputByMonth[monthKey] = (outputByMonth[monthKey] || 0) + output;
  }
});

console.log('Output by month in raw Prod data:');
for (const [k, v] of Object.entries(outputByMonth)) {
  console.log(`${k}: ${v}`);
}
