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

let skippedOutput = 0;

pdRows.forEach((r) => {
  const fgCode = r[14];
  const machine = r[3];
  
  if (!fgCode && !machine) {
    const output = Number(r[11]);
    if (!isNaN(output)) {
      skippedOutput += output;
    }
  }
});

console.log(`Skipped Output (no fgCode AND no machine): ${skippedOutput}`);
