const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find where parseProductMaster actually begins (the first one)
const ppm1 = lines.findIndex(l => l.startsWith('function parseProductMaster('));
// Find the SECOND one
const ppm2 = lines.findIndex((l, i) => i > ppm1 && l.startsWith('function parseProductMaster('));

// Wait, since we are doing this cleanly, let's just use regex to replace everything between the FIRST parseProductMaster and the `return (` of the Dashboard function.
// Or better, let's just write the missing part and replace the duplicated block.

let out = lines.slice(0, ppm1); // everything before parseProductMaster

const cleanBlock = `function parseProductMaster(wb) {
  const ws = wb.Sheets['Product Master'];
  if (!ws) return { rows: [], diag: { found: false, sheet: 'Product Master' } };
  const headerRow = findHeaderRow(ws, PM_COL.productCode, 'Product Code');
  const dataStart = headerRow >= 0 ? headerRow + 1 : PM_HEADER_ROW_IDX;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, range: dataStart, defval: null });
  const out = [];
  for (const r of rows) {
    const productCode = r[PM_COL.productCode];
    if (!productCode || String(productCode).trim() === '') continue;
    const stockLevel = r[PM_COL.stockLevel];
    out.push({
      productCode: String(productCode).trim(),
      category: r[PM_COL.category] || 'Unspecified',
      productName: r[PM_COL.productName] || '',
      machineName: r[PM_COL.machineName] || '',
      product: r[PM_COL.product] || 'Unspecified',
      sku: r[PM_COL.sku] || 'Unspecified',
      caseSize: num(r[PM_COL.caseSize]),
      wtBox: num(r[PM_COL.wtBox]),
      mrp: num(r[PM_COL.mrp]),
      packingType: r[PM_COL.packingType] || '',
      stockLevel: isErrorCell(stockLevel) ? null : num(stockLevel),
      daysStock: isErrorCell(r[PM_COL.daysStock]) ? null : num(r[PM_COL.daysStock]),
    });
  }
  return { rows: out, diag: { found: headerRow >= 0, headerRow, dataStart, rawRowCount: rows.length, parsedRowCount: out.length } };
}

function parseProdData(wb) {
  const ws = wb.Sheets['Prod data'];
  if (!ws) return { rows: [], diag: { found: false, sheet: 'Prod data' } };
  const headerRow = findHeaderRow(ws, PD_COL.date, 'Date');
  const dataStart = headerRow >= 0 ? headerRow + 1 : PD_HEADER_ROW_IDX;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, range: dataStart, defval: null });
  const out = [];
  const occurrence = new Map();
  let skippedNoDate = 0;
  for (const r of rows) {
    const dateVal = r[PD_COL.date];
    const fgCode = r[PD_COL.fgCode];
    const iso = dateVal instanceof Date ? toISODate(dateVal) : null;
    if (!iso || (!fgCode && !r[PD_COL.machine])) { skippedNoDate++; continue; }

    const L = PD_COL.ladies, G = PD_COL.gents;
    const ladies = {
      roaster: num(r[L.roaster]), packing: num(r[L.packing]), blanching: num(r[L.blanching]),
      ingredients: num(r[L.ingredients]), almond: num(r[L.almond]),
      returnRejSorting: num(r[L.returnRejSorting]), bazanaSorting: num(r[L.bazanaSorting]),
      pistaCracking: num(r[L.pistaCracking]), trials: num(r[L.trials]),
      nutCracking: num(r[L.nutCracking]), quality: num(r[L.quality]), energyBar: num(r[L.energyBar]),
      total: num(r[L.total]),
    };
    const loadingUnloading = num(r[G.loadingUnloadingA]) + num(r[G.loadingUnloadingB]);
    const gentsPistaCracking = num(r[G.pistaCrackingA]) + num(r[G.pistaCrackingB]);
    const gents = {
      roaster: num(r[G.roaster]), packing: num(r[G.packing]), blanching: num(r[G.blanching]),
      ingredients: num(r[G.ingredients]), returnRejSorting: num(r[G.returnRejSorting]),
      loadingUnloading, mm: num(r[G.mm]), sarsan: num(r[G.sarsan]),
      bazanaSorting: num(r[G.bazanaSorting]), pistaCracking: gentsPistaCracking,
      nutCracking: num(r[G.nutCracking]), maint: num(r[G.maint]), sweeper: num(r[G.sweeper]),
      energyBar: num(r[G.energyBar]), total: num(r[G.total]),
    };
    const output = num(r[PD_COL.output]);
    const sortingKg = num(r[PD_COL.sortingKg]);
    const machine = r[PD_COL.machine] ? String(r[PD_COL.machine]).trim() : null;
    const fcode = fgCode ? String(fgCode).trim() : null;
    
    // Group identically keyed rows together
    const key = iso + '|' + (fcode || '') + '|' + (machine || '');
    const idx = occurrence.get(key) || 0;
    occurrence.set(key, idx + 1);

    out.push({
      key: key + '|' + idx,
      iso,
      month: iso.substring(0, 7),
      fgCode: fcode,
      machine,
      output,
      sortingKg,
      ladies,
      gents
    });
  }
  const dates = out.map(r => r.iso).sort();
  return {
    rows: out,
    diag: {
      found: headerRow >= 0, headerRow, dataStart,
      rawRowCount: rows.length, parsedRowCount: out.length, skippedNoDate,
      minDate: dates[0] || null, maxDate: dates[dates.length - 1] || null,
    },
  };
}

function mergeProdData(existingByKey, newRows) {
  const merged = { ...existingByKey };
  let added = 0, updated = 0, unchanged = 0;
  for (const r of newRows) {
    const existing = merged[r.key];
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(r)) {
        merged[r.key] = r;
        updated++;
      } else {
        unchanged++;
      }
    } else {
      merged[r.key] = r;
      added++;
    }
  }
  return { merged, added, updated, unchanged };
}

export default function Dashboard() {
  const [tab, setTab] = useState('upload');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [productMaster, setProductMaster] = useState([]);
  const [prodDataByKey, setProdDataByKey] = useState({});
  const [payRates, setPayRates] = useState([]);
  const [importLog, setImportLog] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const masterInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await localforage.getItem('inshell-dashboard-v1');
        if (data) {
          setProductMaster(data.productMaster || []);
          setProdDataByKey(data.prodDataByKey || {});
          setPayRates(data.payRates || []);
          setImportLog(data.importLog || null);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
      setDataLoaded(true);
    }
    loadData();
  }, []);

  const persist = useCallback(async (partial) => {
    try {
      const current = {
        productMaster, prodDataByKey, payRates, importLog,
        ...partial,
      };
      await localforage.setItem('inshell-dashboard-v1', current);
    } catch (e) {
      console.error('Storage save failed', e);
    }
  }, [productMaster, prodDataByKey, payRates, importLog]);

  const handleMasterFile = async (file) => {
    setBusy(true); setErrorMsg(null);
    try {
      const buf = await file.arrayBuffer();
      await new Promise(resolve => setTimeout(resolve, 100)); // Yield to event loop to prevent "page unresponsive" and allow spinner to render
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      const pmResult = parseProductMaster(wb);
      const pdResult = parseProdData(wb);
      const pm = pmResult.rows, pd = pdResult.rows;
      if (!pmResult.diag.found) setErrorMsg('Could not locate the "Product Code" header in Product Master - check the sheet name and layout haven\\'t changed.');
      if (!pdResult.diag.found) setErrorMsg('Could not locate the "Date" header in Prod data - check the sheet name and layout haven\\'t changed.');
      const { merged, added, updated, unchanged } = mergeProdData(prodDataByKey, pd);
      const newLog = {
        ...(importLog || {}),
        master: {
          fileName: file.name, at: new Date().toISOString(), added, updated, unchanged,
          productCount: pm.length, diag: pdResult.diag, pmDiag: pmResult.diag,
        },
      };
      setProductMaster(pm);
      setProdDataByKey(merged);
      setImportLog(newLog);
      await persist({ productMaster: pm, prodDataByKey: merged, importLog: newLog });
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not read that Master file. Please confirm it is an Excel workbook.');
    }
    setBusy(false);
  };

  const savePayRates = async (rates) => {
    setPayRates(rates);
    await persist({ payRates: rates });
  };

  const prodData = useMemo(() => Object.values(prodDataByKey).sort((a, b) => a.iso.localeCompare(b.iso)), [prodDataByKey]);
  const productMasterByCode = useMemo(() => {
    const m = {};
    for (const p of productMaster) m[p.productCode] = p;
    return m;
  }, [productMaster]);

  const hasAnyData = prodData.length > 0 || productMaster.length > 0;
  
  if (!dataLoaded) return null;
`;

// Now find where the return ( actually is in the messed up file
const retIdx = lines.findIndex((l, i) => i > ppm2 && l.includes('return ('));
let remaining = lines.slice(retIdx);

fs.writeFileSync(file, [...out, cleanBlock, ...remaining].join('\\n'), 'utf8');
console.log("Fixed dashboard entirely");
