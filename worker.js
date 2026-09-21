import * as XLSX from 'xlsx';

self.onmessage = async (e) => {
  try {
    const { buf, PM_COL, PD_COL, PM_HEADER_ROW_IDX, PD_HEADER_ROW_IDX } = e.data;
    
    // Read the workbook
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    
    // Utility functions
    function num(v) {
      const n = typeof v === 'number' ? v : parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    }
    function toISODate(d) {
      if (!(d instanceof Date) || isNaN(d)) return null;
      const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
      if (y < 1990 || y > 2100) return null;
      return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    function toMonthKey(iso) {
      return iso ? iso.slice(0, 7) : null;
    }
    function isErrorCell(v) {
      return typeof v === 'string' && v.startsWith('#');
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

    // Parse Product Master
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

    // Parse Prod Data
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
        const rmName = r[PD_COL.rmName] ? String(r[PD_COL.rmName]).trim() : '';
        const kgWorkerStd = num(r[PD_COL.kgWorkerStd]);
        
        const boxes = num(r[PD_COL.boxes]);
        const ipBatch = r[PD_COL.ipBatch] || '';
        const opBatch = r[PD_COL.opBatch] || '';
        const baseKey = [iso, fgCodeStr, machine, boxes, output, ipBatch, opBatch].join('|');
        const occ = occurrence.get(baseKey) || 0;
        occurrence.set(baseKey, occ + 1);
        const rowKey = `${baseKey}#${occ}`;

        const row = {
          rowKey, date: iso, month: toMonthKey(iso), rmName, machine, 
          fgCode: fgCodeStr, output, sortingKg, kgWorkerStd, ladies, gents,
        };
        row.contentHash = JSON.stringify([row.output, row.sortingKg, row.kgWorkerStd, row.ladies, row.gents, row.rmName]);
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

    const pmResult = parseProductMaster(wb);
    const pdResult = parseProdData(wb);

    self.postMessage({ success: true, pmResult, pdResult });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
