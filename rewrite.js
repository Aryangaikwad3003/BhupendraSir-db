const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';

const content = `import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import localforage from 'localforage';

if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const val = await localforage.getItem(key);
      return val ? { value: val } : null;
    },
    set: async (key, value) => {
      await localforage.setItem(key, value);
    }
  };
}

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList
} from 'recharts';
import {
  Upload, Settings as SettingsIcon, TrendingUp, Factory, Package, Users,
  AlertTriangle, CheckCircle2, RefreshCw, Database, ChevronRight, Info,
  FileSpreadsheet, X, Sliders
} from 'lucide-react';

/* =========================================================================
   COLUMN MAPS
   ========================================================================= */
const PM_COL = {
  srNo: 0, category: 1, productCode: 2, productName: 3, machineName: 4,
  product: 5, sku: 6, caseSize: 7, wtBox: 8, mrp: 9, packingType: 10,
  stock: 22, sapUnit: 23, stockLevel: 24, daysStock: 25,
};
const PD_COL = {
  date: 1, rmName: 2, sortingKg: 4,
  machine: 30, fgCode: 41, output: 38,
  ladies: {
    roaster: 55, packing: 56, blanching: 57, ingredients: 58, almond: 59, returnRejSorting: 60,
    bazanaSorting: 61, pistaCracking: 62, trials: 63, nutCracking: 64, quality: 65, energyBar: 66,
    total: 67,
  },
  gents: {
    roaster: 68, packing: 69, blanching: 70, ingredients: 71, returnRejSorting: 72,
    loadingUnloadingA: 73, mm: 74, sarsan: 75, bazanaSorting: 76, pistaCrackingA: 77,
    nutCracking: 78, maint: 79, pistaCrackingB: 80, sweeper: 81, energyBar: 82,
    loadingUnloadingB: 83, total: 84,
  },
};

const PM_HEADER_ROW_IDX = 6;
const PD_HEADER_ROW_IDX = 6;

function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
function toISODate(d) {
  if (!(d instanceof Date) || isNaN(d)) return null;
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
  if (y < 1990 || y > 2100) return null;
  return \`\${y}-\${String(m).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
}
function toMonthKey(iso) {
  return iso ? iso.slice(0, 7) : null;
}
function monthLabel(mk) {
  if (!mk) return '';
  const [y, m] = mk.split('-');
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return \`\${names[parseInt(m, 10) - 1]} \${y.slice(2)}\`;
}
function isErrorCell(v) {
  return typeof v === 'string' && v.startsWith('#');
}
function fmt(n, d = 0) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d });
}
function findHeaderRow(ws, columnIdx, matchText, maxScan = 20) {
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, defval: null });
  const target = matchText.trim().toLowerCase();
  for (let i = 0; i < Math.min(maxScan, raw.length); i++) {
    const cell = raw[i]?.[columnIdx];
    if (typeof cell === 'string' && cell.trim().toLowerCase() === target) return i;
  }
  return -1;
}

function parseProductMaster(wb) {
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

    const fgCodeStr = fgCode ? String(fgCode).trim() : '';
    const machine = r[PD_COL.machine] || '';
    const output = num(r[PD_COL.output]);
    const sortingKg = num(r[PD_COL.sortingKg]);
    const rmName = r[PD_COL.rmName] || '';

    const baseKey = [iso, fgCodeStr, machine, output].join('|');
    const occ = occurrence.get(baseKey) || 0;
    occurrence.set(baseKey, occ + 1);
    const rowKey = \`\${baseKey}#\${occ}\`;

    const row = {
      rowKey, date: iso, month: toMonthKey(iso),
      rmName, machine, fgCode: fgCodeStr, output, sortingKg, ladies, gents,
    };
    row.contentHash = JSON.stringify([row.output, row.sortingKg, row.ladies, row.gents, row.rmName]);
    out.push(row);
  }
  const dates = out.map(r => r.date).sort();
  return {
    rows: out,
    diag: {
      found: headerRow >= 0, headerRow, dataStart,
      rawRowCount: rows.length, parsedRowCount: out.length, skippedNoDate,
      minDate: dates[0] || null, maxDate: dates[dates.length - 1] || null,
    },
  };
}

function mergeProdData(storedByKey, incomingRows) {
  const next = { ...storedByKey };
  let added = 0, updated = 0, unchanged = 0;
  for (const row of incomingRows) {
    const existing = next[row.rowKey];
    if (!existing) {
      next[row.rowKey] = row;
      added++;
    } else if (existing.contentHash !== row.contentHash) {
      next[row.rowKey] = row;
      updated++;
    } else {
      unchanged++;
    }
  }
  return { merged: next, added, updated, unchanged };
}

function getRateForMonth(payRates, month) {
  if (!payRates || payRates.length === 0) return { gents: 0, ladies: 0 };
  const sorted = [...payRates].sort((a, b) => a.month.localeCompare(b.month));
  let applicable = sorted[0];
  for (const r of sorted) {
    if (r.month <= month) applicable = r; else break;
  }
  return { gents: num(applicable.gents), ladies: num(applicable.ladies) };
}

function getWeights(payRates, month) {
  const rate = getRateForMonth(payRates, month);
  if (rate.gents <= 0) return { gents: 1, ladies: 1 };
  return { gents: 1, ladies: rate.ladies / rate.gents };
}

const COLORS = ['#2563EB', '#0891B2', '#D97706', '#7C3AED', '#DC2626', '#059669', '#DB2777', '#4B5563', '#EA580C', '#0D9488'];
const STORAGE_KEY = 'inshell-dashboard-v1';

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false);
  const [productMaster, setProductMaster] = useState([]);
  const [prodDataByKey, setProdDataByKey] = useState({});
  const [payRates, setPayRates] = useState([]);
  const [importLog, setImportLog] = useState(null);
  const [tab, setTab] = useState('upload');
  const [busy, setBusy] = useState(false);
  const [error, setErrorMsg] = useState(null);
  const masterInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const data = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
          setProductMaster(data.productMaster || []);
          setProdDataByKey(data.prodDataByKey || {});
          setPayRates(data.payRates || []);
          setImportLog(data.importLog || null);
          if (Object.keys(data.prodDataByKey || {}).length > 0) setTab('efficiency');
        }
      } catch (e) { }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (partial) => {
    try {
      const current = { productMaster, prodDataByKey, payRates, importLog, ...partial };
      await window.storage.set(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Storage save failed', e);
    }
  }, [productMaster, prodDataByKey, payRates, importLog]);

  const handleMasterFile = async (file) => {
    setBusy(true); setErrorMsg(null);
    try {
      const buf = await file.arrayBuffer();
      await new Promise(r => setTimeout(r, 100)); // Yield to prevent unresponsiveness
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      const pmResult = parseProductMaster(wb);
      const pdResult = parseProdData(wb);
      const pm = pmResult.rows, pd = pdResult.rows;
      if (!pmResult.diag.found) setErrorMsg('Could not locate the "Product Code" header in Product Master — check the sheet name and layout haven\\'t changed.');
      if (!pdResult.diag.found) setErrorMsg('Could not locate the "Date" header in Prod data — check the sheet name and layout haven\\'t changed.');
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
      setTab('efficiency');
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not read that Master file.');
    }
    setBusy(false);
  };

  const savePayRates = async (rates) => {
    setPayRates(rates);
    await persist({ payRates: rates });
  };

  const prodData = useMemo(() => Object.values(prodDataByKey), [prodDataByKey]);
  const productMasterByCode = useMemo(() => {
    const m = {};
    for (const p of productMaster) m[p.productCode] = p;
    return m;
  }, [productMaster]);

  const joinStats = useMemo(() => {
    if (prodData.length === 0) return null;
    let matched = 0;
    for (const r of prodData) if (productMasterByCode[r.fgCode]) matched++;
    return { matched, total: prodData.length, pct: (matched / prodData.length) * 100 };
  }, [prodData, productMasterByCode]);

  const hasAnyData = prodData.length > 0;

  if (!loaded) {
    return (
      <div style={{ minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'ui-sans-serif, system-ui' }}>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', background: '#F7F8FA', minHeight: 640, color: '#1E293B' }}>
      <TopBar tab={tab} setTab={setTab} hasAnyData={hasAnyData} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '20px 24px 48px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13.5, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        {tab === 'upload' && (
          <UploadPanel
            busy={busy}
            onMasterFile={handleMasterFile}
            importLog={importLog}
            masterInputRef={masterInputRef}
            productMasterCount={productMaster.length}
            prodDataCount={prodData.length}
          />
        )}
        {tab === 'efficiency' && (
          hasAnyData
            ? <EfficiencyPanel prodData={prodData} payRates={payRates} productMasterByCode={productMasterByCode} />
            : <EmptyState setTab={setTab} />
        )}
        {tab === 'visuals' && (
          hasAnyData
            ? <VisualsPanel prodData={prodData} productMasterByCode={productMasterByCode} productMaster={productMaster} />
            : <EmptyState setTab={setTab} />
        )}
        {tab === 'settings' && (
          <SettingsPanel payRates={payRates} onSave={savePayRates} importLog={importLog} prodDataCount={prodData.length} productMasterCount={productMaster.length} joinStats={joinStats} />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   TOP BAR
   ========================================================================= */
function TopBar({ tab, setTab, hasAnyData }) {
  const items = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'efficiency', label: 'Manpower Efficiency', icon: Users },
    { id: 'visuals', label: 'Production Visuals', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
  return (
    <div style={{ background: '#111827', color: '#fff' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 16, letterSpacing: 0.2 }}>
          <Factory size={20} color="#38BDF8" />
          Inshell Cracking Ops Dashboard
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {items.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: active ? '#1F2937' : 'transparent',
                  color: active ? '#38BDF8' : '#CBD5E1',
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  transition: 'all .15s',
                }}
              >
                <Icon size={15} /> {label}
                {id !== 'upload' && !hasAnyData && <span style={{ width: 5, height: 5, borderRadius: 5, background: '#F59E0B', marginLeft: 2 }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ setTab }) {
  return (
    <div style={{ background: '#fff', border: '1px dashed #CBD5E1', borderRadius: 12, padding: 48, textAlign: 'center', color: '#64748B' }}>
      <Database size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
      <div style={{ fontSize: 15, marginBottom: 14 }}>No production data loaded yet.</div>
      <button onClick={() => setTab('upload')} style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13.5, cursor: 'pointer', fontWeight: 600 }}>
        Go to Upload
      </button>
    </div>
  );
}

/* =========================================================================
   UPLOAD PANEL
   ========================================================================= */
function UploadPanel({ busy, onMasterFile, importLog, masterInputRef, productMasterCount, prodDataCount }) {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Upload this week's files</div>
        <div style={{ color: '#64748B', fontSize: 13.5, marginTop: 4 }}>
          Re-upload the full workbooks each week. Rows already recorded are matched and skipped automatically — only new or changed rows get added.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <UploadCard
          title="Master file – Summary – Proj VS actual"
          subtitle="Product Master + Prod data (.xlsx)"
          accept=".xlsx"
          inputRef={masterInputRef}
          busy={busy}
          onFile={onMasterFile}
          stat={\`\${productMasterCount} products · \${prodDataCount} production rows on file\`}
          log={importLog?.master}
        />
        <div style={{ padding: 24, background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center' }}>
          <Package size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>No daily report needed</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Bazana Sorting stats are now pulled directly from the Master File</div>
        </div>
      </div>

      {importLog?.master && (
        <div style={{ marginTop: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '14px 18px', fontSize: 13.5, color: '#166534' }}>
          <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={15} /> Last import result</div>
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>
            +\{importLog.master.added} new rows · ↻ \{importLog.master.updated} updated · \{importLog.master.unchanged} unchanged (skipped)
          </span>
        </div>
      )}
    </div>
  );
}

function UploadCard({ title, subtitle, accept, inputRef, busy, onFile, stat, log }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      style={{
        background: '#fff', border: \`1.5px dashed \${dragOver ? '#2563EB' : '#CBD5E1'}\`,
        borderRadius: 12, padding: 26, textAlign: 'center', cursor: 'pointer',
        transition: 'border-color .15s',
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file" ref={inputRef} accept={accept} style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
      <FileSpreadsheet size={26} color="#2563EB" style={{ marginBottom: 8 }} />
      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</div>
      <div style={{ color: '#94A3B8', fontSize: 12.5, marginTop: 3 }}>{subtitle}</div>
      <div style={{ marginTop: 14, fontSize: 12, color: '#64748B' }}>{stat}</div>
      {log && <div style={{ marginTop: 8, fontSize: 11.5, color: '#94A3B8' }}>Last: {log.fileName} · {new Date(log.at).toLocaleString()}</div>}
      <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#2563EB', padding: '7px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600 }}>
        {busy ? <RefreshCw size={13} className="spin" /> : <Upload size={13} />} {busy ? 'Processing…' : 'Choose or drop file'}
      </div>
    </div>
  );
}

/* =========================================================================
   EFFICIENCY PANEL
   ========================================================================= */
function EfficiencyPanel({ prodData, payRates, productMasterByCode }) {
  const months = useMemo(() => [...new Set(prodData.map(r => r.month))].sort(), [prodData]);
  const [month, setMonth] = useState('all');
  const [groupBy, setGroupBy] = useState('product'); // product | machine | category

  const filtered = useMemo(() => month === 'all' ? prodData : prodData.filter(r => r.month === month), [prodData, month]);

  // Bazana Sorting from Master file (pre-sorting logic: row must have Sorting Kg > 0 or rmName present, AND some bazana ladies/gents manpower)
  const bazanaStats = useMemo(() => {
    const byDate = {};
    for (const row of prodData) {
      if (row.ladies.bazanaSorting <= 0 && row.gents.bazanaSorting <= 0) continue;
      // Pre-sorting filter
      if (row.sortingKg <= 0 && !row.rmName) continue;
      
      if (!byDate[row.date]) byDate[row.date] = { date: row.date, month: row.month, weightedManpower: 0, qty: 0 };
      const w = getWeights(payRates, row.month);
      byDate[row.date].weightedManpower += (row.ladies.bazanaSorting * w.ladies) + (row.gents.bazanaSorting * w.gents);
      byDate[row.date].qty += row.sortingKg;
    }
    const merged = Object.values(byDate).filter(d => d.qty > 0 && d.weightedManpower > 0);
    const byMonth = {};
    for (const d of merged) {
      if (!byMonth[d.month]) byMonth[d.month] = { month: d.month, weightedManpower: 0, qty: 0 };
      byMonth[d.month].weightedManpower += d.weightedManpower;
      byMonth[d.month].qty += d.qty;
    }
    const monthly = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      name: monthLabel(m.month),
      actual: Math.round(m.qty / m.weightedManpower),
      qty: m.qty,
    }));
    return { monthly };
  }, [prodData, payRates]);

  const regularStats = useMemo(() => {
    const groups = {};
    for (const row of filtered) {
      const pm = productMasterByCode[row.fgCode];
      const key = groupBy === 'machine' ? (row.machine || 'Unspecified')
        : groupBy === 'category' ? (pm?.category || 'Unspecified')
        : (pm?.product || row.rmName || 'Unspecified');
      if (!groups[key]) groups[key] = { key, weightedManpower: 0, qty: 0, stdWeightedSum: 0, stdWeight: 0 };
      const w = getWeights(payRates, row.month);
      const ladiesRegular = row.ladies.total - row.ladies.bazanaSorting;
      const gentsRegular = row.gents.total - row.gents.bazanaSorting - row.gents.loadingUnloading;
      const weightedManpower = Math.max(0, ladiesRegular) * w.ladies + Math.max(0, gentsRegular) * w.gents;
      groups[key].weightedManpower += weightedManpower;
      groups[key].qty += row.output;
      if (row.kgWorkerStd && row.kgWorkerStd > 0) {
        groups[key].stdWeightedSum += row.kgWorkerStd * row.output;
        groups[key].stdWeight += row.output;
      }
    }
    return Object.values(groups).map(g => ({
      name: g.key,
      actual: g.weightedManpower > 0 ? Math.round(g.qty / g.weightedManpower) : 0,
      std: g.stdWeight > 0 ? Math.round(g.stdWeightedSum / g.stdWeight) : 0,
      qty: g.qty,
    })).filter(g => g.qty > 0).sort((a, b) => b.qty - a.qty).slice(0, 14);
  }, [filtered, payRates, productMasterByCode, groupBy]);

  const loadingUnloadingStats = useMemo(() => {
    const byMonth = {};
    for (const row of prodData) {
      if (row.gents.loadingUnloading <= 0) continue;
      if (!byMonth[row.month]) byMonth[row.month] = { month: row.month, weightedManpower: 0, qty: 0 };
      const w = getWeights(payRates, row.month);
      byMonth[row.month].weightedManpower += row.gents.loadingUnloading * w.gents;
      byMonth[row.month].qty += row.output;
    }
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      name: monthLabel(m.month),
      actual: m.weightedManpower > 0 ? Math.round(m.qty / m.weightedManpower) : 0,
      qty: m.qty,
    }));
  }, [prodData, payRates]);

  const noRates = payRates.length === 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Manpower Efficiency — KG/Worker Actual vs STD</div>
          <div style={{ color: '#64748B', fontSize: 13, marginTop: 3, maxWidth: 680 }}>
            Actual = Total Output (kg) ÷ Equivalent Workers.
          </div>
        </div>
        <FilterBar month={month} setMonth={setMonth} months={months} groupBy={groupBy} setGroupBy={setGroupBy} />
      </div>

      {noRates && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', padding: '10px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Info size={15} /> No Gents/Ladies pay rates set yet — Actual figures will show as 0 until you add rates in Settings.
        </div>
      )}

      <Section title={\`Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : 'Category / Customer'}\`} icon={Users}>
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 10 }}>
          <div style={{ minWidth: 800 }}>
            <ResponsiveContainer width="100%" height={Math.max(400, regularStats.length * 30 + 100)}>
              <BarChart data={regularStats} layout="vertical" margin={{ top: 8, right: 40, left: 160, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
                <Tooltip formatter={(v, n) => [fmt(v, 0), n === 'actual' ? 'Actual' : 'STD']} />
                <Legend />
                <Bar dataKey="std" name="STD" fill="#CBD5E1" radius={[0, 3, 3, 0]}>
                   <LabelList dataKey="std" position="right" fontSize={11} fill="#64748B" />
                </Bar>
                <Bar dataKey="actual" name="Actual" fill="#2563EB" radius={[0, 3, 3, 0]}>
                   <LabelList dataKey="actual" position="right" fontSize={11} fill="#1E40AF" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <VarianceTable rows={regularStats} />
      </Section>

      <Section title="Loading & Unloading (Gents) — Month-wise" icon={Package}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={loadingUnloadingStats} margin={{ top: 8, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11.5 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmt(v, 0)} />
            <Line type="monotone" dataKey="actual" name="Actual KG/Worker" stroke="#0891B2" strokeWidth={2.5} dot={{ r: 4 }}>
              <LabelList dataKey="actual" position="top" fontSize={11} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Bazana Sorting — Month-wise (Calculated from Master File Pre-Sorting entries)" icon={Package}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={bazanaStats.monthly} margin={{ top: 8, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11.5 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmt(v, 0)} />
            <Line type="monotone" dataKey="actual" name="Actual KG/Worker" stroke="#D97706" strokeWidth={2.5} dot={{ r: 4 }}>
               <LabelList dataKey="actual" position="top" fontSize={11} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

function VarianceTable({ rows }) {
  return (
    <div style={{ marginTop: 16, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #E2E8F0', textAlign: 'left', color: '#64748B' }}>
            <th style={{ padding: '6px 10px' }}>Name</th>
            <th style={{ padding: '6px 10px', textAlign: 'right' }}>STD (kg/worker)</th>
            <th style={{ padding: '6px 10px', textAlign: 'right' }}>Actual (kg/worker)</th>
            <th style={{ padding: '6px 10px', textAlign: 'right' }}>Variance</th>
            <th style={{ padding: '6px 10px', textAlign: 'right' }}>Output (kg)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const variance = r.std > 0 ? ((r.actual - r.std) / r.std) * 100 : null;
            const good = variance !== null && variance >= 0;
            return (
              <tr key={r.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '7px 10px', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>{fmt(r.std, 0)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>{fmt(r.actual, 0)}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: variance === null ? '#94A3B8' : good ? '#059669' : '#DC2626' }}>
                  {variance === null ? '—' : \`\${variance >= 0 ? '+' : ''}\${fmt(variance, 1)}%\`}
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', color: '#64748B' }}>{fmt(r.qty, 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   PRODUCTION VISUALS PANEL
   ========================================================================= */
function VisualsPanel({ prodData, productMasterByCode, productMaster }) {
  const months = useMemo(() => [...new Set(prodData.map(r => r.month))].sort(), [prodData]);
  const [month, setMonth] = useState('all');
  const [machine, setMachine] = useState('all');
  const [category, setCategory] = useState('all');

  const machines = useMemo(() => [...new Set(prodData.map(r => r.machine).filter(Boolean))].sort(), [prodData]);
  const categories = useMemo(() => [...new Set(productMaster.map(p => p.category).filter(Boolean))].sort(), [productMaster]);

  const filtered = useMemo(() => prodData.filter(r => {
    if (month !== 'all' && r.month !== month) return false;
    if (machine !== 'all' && r.machine !== machine) return false;
    if (category !== 'all') {
      const pm = productMasterByCode[r.fgCode];
      if (!pm || pm.category !== category) return false;
    }
    return true;
  }), [prodData, month, machine, category, productMasterByCode]);

  const byProduct = useMemo(() => aggregateSum(filtered, r => productMasterByCode[r.fgCode]?.product || r.rmName || 'Unspecified', 'output'), [filtered, productMasterByCode]);
  const byMachine = useMemo(() => aggregateSum(filtered, r => r.machine || 'Unspecified', 'output'), [filtered]);
  const bySKU = useMemo(() => aggregateSum(filtered, r => productMasterByCode[r.fgCode]?.sku || 'Unmapped', 'output'), [filtered, productMasterByCode]);
  const byCategory = useMemo(() => aggregateSum(filtered, r => productMasterByCode[r.fgCode]?.category || 'Unspecified', 'output'), [filtered, productMasterByCode]);

  const monthlyTrend = useMemo(() => {
    const byMonth = {};
    for (const r of filtered) {
      if (!byMonth[r.month]) byMonth[r.month] = { month: r.month, output: 0 };
      byMonth[r.month].output += r.output;
    }
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({ name: monthLabel(m.month), output: m.output }));
  }, [filtered]);

  const machineByProduct = useMemo(() => {
    const products = [...new Set(byProduct.map(p => p.name))].slice(0, 8);
    const machinesTop = [...new Set(byMachine.map(m => m.name))].slice(0, 8);
    const matrix = {};
    for (const r of filtered) {
      const p = productMasterByCode[r.fgCode]?.product || r.rmName || 'Unspecified';
      const mch = r.machine || 'Unspecified';
      if (!products.includes(p) || !machinesTop.includes(mch)) continue;
      matrix[p] = matrix[p] || {};
      matrix[p][mch] = (matrix[p][mch] || 0) + r.output;
    }
    return { products, machines: machinesTop, matrix };
  }, [filtered, byProduct, byMachine, productMasterByCode]);

  const stockRows = useMemo(() => {
    const rows = productMaster.filter(p => p.stockLevel !== null && p.stockLevel > 0 && (category === 'all' || p.category === category));
    const byProd = {};
    for (const p of rows) {
      byProd[p.product] = (byProd[p.product] || 0) + p.stockLevel;
    }
    return Object.entries(byProd).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [productMaster, category]);
  const stockAvailable = productMaster.some(p => p.stockLevel !== null);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Production Visuals</div>
          <div style={{ color: '#64748B', fontSize: 13, marginTop: 3 }}>Live equivalents of the "Product machine Summary" pivots.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Dropdown label="Month" value={month} onChange={setMonth} options={[['all', 'All months'], ...months.map(m => [m, monthLabel(m)])]} />
          <Dropdown label="Machine" value={machine} onChange={setMachine} options={[['all', 'All machines'], ...machines.map(m => [m, m])]} />
          <Dropdown label="Category" value={category} onChange={setCategory} options={[['all', 'All categories'], ...categories.map(c => [c, c])]} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Section title="Output by Product" icon={Package} compact>
          <RankedBarChart data={byProduct} color="#2563EB" />
        </Section>
        <Section title="Output by Machine / Process" icon={Factory} compact>
          <RankedBarChart data={byMachine} color="#0891B2" />
        </Section>
        <Section title="Output by SKU" icon={Package} compact>
          <RankedBarChart data={bySKU.slice(0, 10)} color="#7C3AED" />
        </Section>
        <Section title="Output by Category / Customer" icon={Users} compact>
          <PieBreakdown data={byCategory} />
        </Section>
      </div>

      <Section title="Output Trend (Monthly)" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyTrend} margin={{ top: 8, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11.5 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmt(v, 0)} />
            <Line type="monotone" dataKey="output" name="Output (kg)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }}>
              <LabelList dataKey="output" position="top" fontSize={11} formatter={(v) => fmt(v, 0)} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Product × Machine Matrix" icon={Sliders}>
        <MatrixTable data={machineByProduct} />
      </Section>

      <Section title="Stock by Product" icon={Database}>
        {stockAvailable ? <RankedBarChart data={stockRows} color="#059669" unit="kg" /> : (
          <div style={{ color: '#94A3B8', fontSize: 13, padding: '18px 4px' }}>
            Stock level data is currently broken in the source file.
          </div>
        )}
      </Section>
    </div>
  );
}

function aggregateSum(rows, keyFn, valueField) {
  const m = {};
  for (const r of rows) {
    const k = keyFn(r);
    m[k] = (m[k] || 0) + r[valueField];
  }
  return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function RankedBarChart({ data, color, unit = 'kg' }) {
  const height = Math.max(260, data.length * 30 + 40);
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <div style={{ minWidth: 400 }}>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 160, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 10.5 }} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11.5 }} />
            <Tooltip formatter={(v) => [\`\${fmt(v, 0)} \${unit}\`, 'Output']} />
            <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="value" position="right" fontSize={11} fill="#64748B" formatter={(v) => fmt(v, 0)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PieBreakdown({ data }) {
  const top = data.slice(0, 9);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={top} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`} labelLine={false} fontSize={10.5}>
          {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => fmt(v, 0)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function MatrixTable({ data }) {
  const { products, machines, matrix } = data;
  if (products.length === 0) return <div style={{ color: '#94A3B8', fontSize: 13 }}>No data for the current filter selection.</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: '7px 10px', textAlign: 'left', color: '#64748B', borderBottom: '1.5px solid #E2E8F0' }}>Product</th>
            {machines.map(m => <th key={m} style={{ padding: '7px 10px', textAlign: 'right', color: '#64748B', borderBottom: '1.5px solid #E2E8F0' }}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '7px 10px', fontWeight: 500 }}>{p}</td>
              {machines.map(m => {
                const v = matrix[p]?.[m] || 0;
                return <td key={m} style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'ui-monospace, monospace', background: v > 0 ? \`rgba(37,99,235,\${Math.min(0.05 + v / 200000, 0.28)})\` : 'transparent' }}>{v > 0 ? fmt(v, 0) : '—'}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   SETTINGS PANEL
   ========================================================================= */
function SettingsPanel({ payRates, onSave, importLog, prodDataCount, productMasterCount, joinStats }) {
  const [rows, setRows] = useState(payRates.length ? payRates : [{ month: new Date().toISOString().slice(0, 7), gents: '', ladies: '' }]);
  const [savedFlash, setSavedFlash] = useState(false);

  const updateRow = (i, field, value) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: value };
    setRows(next);
  };
  const addRow = () => setRows([...rows, { month: '', gents: '', ladies: '' }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const save = async () => {
    const clean = rows.filter(r => r.month && r.gents !== '' && r.ladies !== '').map(r => ({ month: r.month, gents: num(r.gents), ladies: num(r.ladies) }));
    await onSave(clean);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  return (
    <div>
      <Section title="Gents / Ladies Pay Rates (effective-dated)" icon={SettingsIcon}>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
          Set a rate starting from a given month.
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748B' }}>
              <th style={{ padding: '6px 8px' }}>Effective from (month)</th>
              <th style={{ padding: '6px 8px' }}>Gents rate / day</th>
              <th style={{ padding: '6px 8px' }}>Ladies rate / day</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: '5px 8px' }}>
                  <input type="month" value={r.month} onChange={e => updateRow(i, 'month', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '5px 8px' }}>
                  <input type="number" placeholder="₹ / day" value={r.gents} onChange={e => updateRow(i, 'gents', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '5px 8px' }}>
                  <input type="number" placeholder="₹ / day" value={r.ladies} onChange={e => updateRow(i, 'ladies', e.target.value)} style={inputStyle} />
                </td>
                <td style={{ padding: '5px 8px' }}>
                  <button onClick={() => removeRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={addRow} style={{ ...btnGhost }}>+ Add rate change</button>
          <button onClick={save} style={{ ...btnPrimary }}>{savedFlash ? 'Saved ✓' : 'Save rates'}</button>
        </div>
      </Section>

      <Section title="Data on file" icon={Database}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <StatBox label="Product Master rows" value={productMasterCount} />
          <StatBox label="Prod data rows (merged)" value={prodDataCount} />
        </div>
      </Section>

      {joinStats && (
        <Section title="Data Quality — Product Code / FG Code Join" icon={AlertTriangle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: joinStats.pct > 90 ? '#059669' : joinStats.pct > 75 ? '#D97706' : '#DC2626' }}>
              {fmt(joinStats.pct, 1)}%
            </div>
            <div style={{ fontSize: 12.5, color: '#64748B' }}>
              {joinStats.matched} of {joinStats.total} Prod data rows matched a Product Master row via FG Code.<br />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{fmt(value, 0)}</div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{label}</div>
    </div>
  );
}

const inputStyle = { border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 9px', fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnPrimary = { background: '#2563EB', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 };
const btnGhost = { background: '#fff', color: '#334155', border: '1px solid #E2E8F0', padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 };

/* =========================================================================
   SHARED UI BITS
   ========================================================================= */
function Section({ title, icon: Icon, children, compact }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: compact ? 16 : 20, marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700, fontSize: 14.5 }}>
        {Icon && <Icon size={16} color="#2563EB" />} {title}
      </div>
      {children}
    </div>
  );
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <div>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 10px', fontSize: 12.5, background: '#fff', color: '#334155', cursor: 'pointer' }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function FilterBar({ month, setMonth, months, groupBy, setGroupBy }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Dropdown label="Month" value={month} onChange={setMonth} options={[['all', 'All months'], ...months.map(m => [m, monthLabel(m)])]} />
      <Dropdown label="Group" value={groupBy} onChange={setGroupBy} options={[['product', 'By Product'], ['machine', 'By Machine'], ['category', 'By Category']]} />
    </div>
  );
}
\n`;
fs.writeFileSync(file, content, 'utf8');
console.log("Written completely new Dashboard.jsx");
