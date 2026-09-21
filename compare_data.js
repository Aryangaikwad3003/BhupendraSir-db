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

const pmWs = workbook.Sheets['Product Master'];
const pdWs = workbook.Sheets['Prod data'];

const pdHeaderRow = findHeaderRow(pdWs, 1, 'Date');
const pdRows = XLSX.utils.sheet_to_json(pdWs, { header: 1, range: pdHeaderRow + 1, defval: null });

let totalOutput = 0;
let validRows = 0;
let skippedNoDate = 0;
let skippedNoFgOrMachine = 0;

pdRows.forEach((r, idx) => {
  const dateVal = r[1];
  const fgCode = r[14];
  const machine = r[3];
  
  if (!dateVal || !(dateVal instanceof Date)) {
    skippedNoDate++;
    return;
  }
  
  if (!fgCode && !machine) {
    skippedNoFgOrMachine++;
    return;
  }
  
  const output = Number(r[11]);
  if (!isNaN(output)) {
    totalOutput += output;
    validRows++;
  }
});

console.log(`Parsed Prod Data. Total Output: ${totalOutput}`);
console.log(`Valid rows: ${validRows}, skipped no date: ${skippedNoDate}, skipped no fg/machine: ${skippedNoFgOrMachine}`);
