const XLSX = require('xlsx');

function parseDate(v) {
  if (typeof v === 'number') {
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  return null;
}

const master = XLSX.readFile('Master file- Summary - Proj VS actual.xlsx');
const pdSheet = master.Sheets['Prod data'];
const pdJson = XLSX.utils.sheet_to_json(pdSheet, { header: 1, range: 0, defval: null });

let manpowerByDate = {};
for (let i = 1; i < pdJson.length; i++) {
  const row = pdJson[i];
  if (!row[1]) continue;
  const dt = parseDate(row[1]);
  if (!dt) continue;
  
  const ladiesBazana = typeof row[28] === 'number' ? row[28] : 0;
  const gentsBazana = typeof row[27] === 'number' ? row[27] : 0;
  
  if (ladiesBazana > 0 || gentsBazana > 0) {
    if (!manpowerByDate[dt]) manpowerByDate[dt] = 0;
    manpowerByDate[dt] += ladiesBazana + gentsBazana;
  }
}

const daily = XLSX.readFile('Daily Report Inshell Cracking.xlsb');
const drSheet = daily.Sheets['Daily report'];
const drJson = XLSX.utils.sheet_to_json(drSheet, { header: 1, range: 0, defval: null });

let kgByDate = {};
for (let i = 1; i < drJson.length; i++) {
  const row = drJson[i];
  if (!row[1]) continue;
  const dt = parseDate(row[1]);
  if (!dt) continue;
  
  const sortingKg = typeof row[8] === 'number' ? row[8] : 0; // I in original file, let's assume index 8
  if (sortingKg > 0) {
    if (!kgByDate[dt]) kgByDate[dt] = 0;
    kgByDate[dt] += sortingKg;
  }
}

console.log("Days with Bazana manpower in May:");
const mayManpower = Object.keys(manpowerByDate).filter(d => d.startsWith('2026-05'));
console.log(mayManpower);

console.log("Days with Sorting KG in May:");
const mayKg = Object.keys(kgByDate).filter(d => d.startsWith('2026-05'));
console.log(mayKg);

console.log("Matched days in May:");
const matchedMay = mayManpower.filter(d => mayKg.includes(d));
console.log(matchedMay);
