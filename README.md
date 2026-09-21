# Inshell Cracking Ops Dashboard — Project README

A single-file React artifact (`Dashboard.jsx`) that turns two weekly Excel exports
into a manpower-efficiency and production-visualization dashboard for an inshell
nut cracking / packing operation. This document captures the full requirements,
data model, business logic, known issues, and design decisions discussed while
building it, so another developer (human or AI) can pick this up with full
context.

---

## 1. What this dashboard is for

The factory produces two recurring Excel exports:

1. **`Master file - Summary - Proj VS actual.xlsx`** — the main production
   tracker. Contains the product catalog, a daily production log with
   manpower breakdowns, and a hand-built set of pivot tables summarizing
   output by product/machine/category.
2. **`Daily_Report_Inshell_Cracking.xlsb`** — a separate daily report for the
   inshell cracking/grading process, which happens to also carry the
   "Sorting KG" figures needed for one specific calculation (Bazana Sorting).

The two things the business wants out of this:

1. **A visual (chart-based) equivalent of every pivot table in the
   "Product machine Summary" sheet**, with the same kind of filter/slicer
   controls the pivots have (month, machine, category, product).
2. **A KG/Worker "Actual" metric, calculated from raw manpower + output
   data, compared against the existing KG/Worker "STD" (standard/target)
   column** — split into three separate calculations because three
   different labor categories behave differently:
   - Regular production manpower (excluding Loading/Unloading and Bazana
     Sorting labor)
   - Loading & Unloading (Gents only), rolled up **month-wise**
   - Bazana Sorting (Gents + Ladies), which can only be computed
     **day-wise, across all products combined** (see §5.3 for why)

Files are re-uploaded **weekly**, as full workbooks (not deltas) — the app is
responsible for figuring out what's new vs. already known (see §6).

---

## 2. Source file structure (validated against real files)

Column indices below are **0-based** (column A = 0) and were confirmed by
parsing the actual uploaded files, not assumed from visual inspection.

### 2.1 `Product Master` sheet (in the Master xlsx)

Header row is **auto-detected** at runtime by scanning for the literal text
`"Product Code"` in column C (index 2) — do not hardcode a row number, see
§8.1 for why this bit the project once already.

| Field | Column | Notes |
|---|---|---|
| Category | B (1) | Actually customer/channel codes (APMC, DMART, MT, TATA, CRED, GT, STAR, REL NP, CPC…), not a product category |
| Product Code | C (2) | **Join key** to Prod data's `FG CODE` |
| Product Name | D (3) | Long descriptive name |
| Machine Name | E (4) | |
| Product | F (5) | Broad product family (Almond, Pista, Cashew, Raisins…) — used as the main grouping dimension in charts |
| SKU | G (6) | Actually a **pack size** label (e.g. "10 kg", "500 gm"), not a numeric SKU code |
| Case Size | H (7) | |
| Wt/Box (kg) | I (8) | |
| MRP | J (9) | |
| Packing Type | K (10) | |
| Stock | V (21) | **Currently broken** — resolves to `#REF!` in the source file for most rows (broken external reference). Parser stores `null` when it detects an error cell. |
| SAP Unit in Stock | W (22) | Same issue |
| Stock level kg(pcs)/Box | X (23) | Same issue — this is the field the business actually wants for the Stock pivot |
| No of days stock | Y (24) | Same issue |

**Known issue, accepted by the business (not fixable in code):** the Stock
columns are broken formulas in the source workbook. The dashboard is built to
pick these up automatically the moment they contain real numbers in a future
upload; until then it shows a "Stock data unavailable" placeholder rather
than blocking or crashing.

### 2.2 `Prod data` sheet (in the Master xlsx) — the daily production log

Header row is **auto-detected** by scanning for `"Date"` in column B
(index 1). ~3,195 data rows as of the file this was built against, spanning
**2026-04-01 to 2026-07-27**.

| Field | Column | Notes |
|---|---|---|
| Date | B (1) | |
| RM Name | C (2) | Raw material / batch label — used as a fallback grouping key when FG Code doesn't join (see §7) |
| Machine/process | D (3) | |
| FG Name | E (4) | |
| I/P Batch No | F (5) | Part of the row-identity composite key |
| Party Batch | G (6) | |
| O/P Batch No | H (7) | Part of the row-identity composite key |
| SKU | I (8) | **Do not use this for the "SKU-wise" chart** — this is a numeric code local to Prod data, not the pack-size SKU the business means. Join to Product Master's SKU field via FG Code instead (this was a bug, fixed — see §8.2). |
| Boxes | J (9) | |
| wt/Box | K (10) | |
| Output | L (11) | The "Qty" used throughout the efficiency calculations |
| FG CODE | O (14) | **Join key** to Product Master's Product Code — **~15% of rows have a SAP order number here instead of a real product code** (a source-data inconsistency, not a parsing bug — see §7) |
| Done By | Q (16) | |
| EFF. | S (18) | |
| KG/WORKER STD | T (19) | The existing standard/target figure to compare Actual against |

**Ladies manpower block**, columns AC–AO (28–40): Roaster, Packing,
Blanching, Ingredients, Almond, Return Rej sorting, **Bazana Sorting**,
Pista cracking, Trials, Nut Cracking, Quality, Energy Bar, **Total**.
Verified: `Total` = sum of the task columns for that row.

**Gents manpower block**, columns AP–BF (41–57): Roaster, Packing,
Blanching, Ingredients, Return Rej sorting, **Loading/Unloading**, MM,
SARSAN, **Bazana Sorting**, Pista cracking, Nut Cracking, Maint,
**Pista Cracking** *(duplicate — appears a second time under a different
column, likely inconsistent data entry)*, Sweeper, Energy Bar,
**Loading unloading** *(duplicate of the earlier Loading/Unloading
column)*, **Total**.

Per explicit instruction from the business:
- The two `Loading/Unloading` columns are **merged** into one figure.
- The two `Pista Cracking` columns are **merged** into one figure, and
  counted as **normal** (non-excluded) production manpower — unlike
  Loading/Unloading and Bazana Sorting, which are excluded from the
  regular-production calculation.

These merges happen in `parseProdData()` when building the `gents` object.

### 2.3 `Prod` sheet (in the Daily Report xlsb)

Header row is **auto-detected** by scanning for `"DATE"` in column B
(index 1). This is a large, differently-structured sheet (inshell
cracking/grading log — Gold, Choco, Broken, HPR, CSR grading columns etc.)
that the dashboard mostly ignores. The **only two fields used**:

| Field | Column | Notes |
|---|---|---|
| DATE | B (1) | Join key back to Prod data, **by date only** — this sheet has no product/FG-code reference field, so Bazana Sorting Qty can only be matched by date, not by product (see §5.3) |
| Sorting KG | AT (45) | The Qty figure for the Bazana Sorting KG/Worker calculation |

Date range in this sheet is much wider (2020–2035, mostly placeholder/future
rows) than the Master file's April–July 2026 window; only overlapping dates
matter.

---

## 3. Business logic / formulas actually implemented

### 3.1 Regular production KG/Worker Actual

```
For each Prod data row:
  ladiesRegular = ladies.total - ladies.bazanaSorting
  gentsRegular  = gents.total - gents.bazanaSorting - gents.loadingUnloading (merged)
  weight        = getWeights(payRates, row.month)   // see §3.4
  equivalentWorkers += ladiesRegular * weight.ladies + gentsRegular * weight.gents
  qty += row.output

Actual (kg/worker) = Total Qty / Total Equivalent Workers
```

Grouped by Product / Machine / Category (user-selectable), and by month
filter. STD is shown alongside as an output-weighted average of the row-level
`KG/WORKER STD` values in that same group.

### 3.2 Loading & Unloading (Gents), month-wise

```
For each row where gents.loadingUnloading > 0:
  equivalentWorkers += gents.loadingUnloading * weight.gents   // weight.gents is always 1
  qty += row.output   // per business instruction: "total quantity of output
                       //  wherever the Loading & Unloading numbers are present
                       //  under gents" — i.e. NOT product-specific, aggregated
                       //  across all rows with L&U manpower that month

Actual (kg/worker) = Total Qty / Total Equivalent Workers, rolled up by month
```

### 3.3 Bazana Sorting, day-level, all products combined

```
For each date:
  manpowerFromMasterFile = sum(ladies.bazanaSorting) * weight.ladies
                          + sum(gents.bazanaSorting) * weight.gents      [from Prod data]
  qty = sum(sortingKG for that date)                                     [from xlsb Prod sheet]

Actual (kg/worker) = qty / manpowerFromMasterFile, per date, then rolled up by month
```

**This is explicitly day-level only, not per-product**, because the xlsb
file's `Sorting KG` has no product/lot reference field to join on — confirmed
with the business, who accepted this limitation. Manpower side is per-product
in Prod data but gets summed across all products logged for that date before
matching. Only ~15–20% of days that have Bazana Sorting manpower logged also
have a matching Sorting KG entry in the xlsb file on the same date (typical
of two independently-maintained logs) — this match rate is worth watching if
the business wants to eventually improve it.

### 3.4 The pay-rate weighting decision — READ THIS BEFORE CHANGING THE FORMULA

The business's literal stated formula was:

> "KG/WORKER Actual via formula -> **Total Manpower / Total Qty**... Total
> Manpower: Count of Gents × Pay for gents/day + Count of Ladies × Pay for
> ladies/day"

Implemented literally (Manpower ÷ Qty, with Manpower as raw currency), this
produces numbers on a completely different scale from the existing
`KG/WORKER STD` column (tested against real data: Actual came out ~0.2–0.5
vs. STD values of ~200–600 — a ~1000x mismatch), because multiplying
headcount by absolute rupee rates produces a currency-denominated number, not
a worker-count-denominated one.

**Engineering decision made (needs business sign-off, flagged to them, not
yet explicitly confirmed):** the formula was inverted to `Qty ÷ Manpower`,
**and** the pay rate is used as a *relative weighting factor* rather than an
absolute multiplier — Gents is pinned to weight `1`, and Ladies gets weight
`ladiesRate / gentsRate`. This is implemented in `getWeights()`:

```js
function getWeights(payRates, month) {
  const rate = getRateForMonth(payRates, month);
  if (rate.gents <= 0) return { gents: 1, ladies: 1 };
  return { gents: 1, ladies: rate.ladies / rate.gents };
}
```

This keeps "Equivalent Workers" on the same order of magnitude as a plain
headcount, so `Qty / Equivalent Workers` lands in the same numeric range as
`KG/WORKER STD` (validated with dummy rates: Actual 79–241 vs STD 194–590 —
a believable, comparable spread). **If the business says this doesn't match
their mental model, it's a two-function change** (`getWeights` +
possibly flipping the division in the three calc sites in
`EfficiencyPanel`) — don't need to re-architect anything.

### 3.5 Effective-dated pay rates

`payRates` is stored as `[{ month: 'YYYY-MM', gents: number, ladies: number }]`.
`getRateForMonth(payRates, month)` finds the latest entry whose `month` is
`<=` the target month — so setting a new rate for, say, July only affects
July onward; earlier months keep whichever rate was active for them at the
time. This was an explicit requirement ("mostly flat rates but... for those
months we need to take the respective rates keeping the previous months
rates the same as they are set by the user").

---

## 4. Join keys & product identity

- **Product Master ↔ Prod data**: joins on `Product Code` (Product Master) =
  `FG CODE` (Prod data). Confirmed by the business as the correct key.
- **~15% of Prod data rows have a SAP order number in the FG CODE column
  instead of a real product code** (e.g. `14000000013866` instead of
  something like `BZ000151`). This is a genuine inconsistency in the source
  data, not a bug. Unmatched rows fall back to grouping by `RM Name` instead
  of Product Master's `Product` field, so they still count toward totals but
  lose Category/Product-family grouping. The dashboard surfaces the match
  rate live under **Settings → Data Quality**.
- **SKU-wise chart** uses `productMasterByCode[row.fgCode]?.sku` (i.e.
  Product Master's SKU/pack-size field, joined via FG Code) — **not**
  `row.sku` from Prod data directly, which is a different, unrelated numeric
  code. (This was a bug — see changelog §8.2.)

---

## 5. Incremental upload / row identity

The business explicitly wants: re-upload the full workbook every week,
**skip rows already processed, but catch corrections to existing rows**
("it may be possible the new data sheet comes with some update in numbers
for some latest older data").

**Row identity key** (explicitly chosen by the business over alternatives):

```
baseKey = date | fgCode | machine | boxes | output | ipBatch | opBatch
```

Because the business confirmed **the same product can legitimately be
re-run multiple times on the same day with identical Date/FG
Code/Machine/Boxes/Output** (no deduplication wanted), an **occurrence
index** is appended to disambiguate legitimate repeats in encounter order:

```
rowKey = `${baseKey}#${occurrenceIndexWithinThisFile}`
```

**Caveat, not fully solved:** this occurrence-index approach assumes row
order stays consistent between uploads (i.e. the same repeat batch appears
in the same relative position each week). If the source sheet's row order
ever gets reshuffled between uploads, a legitimate duplicate-key row could
theoretically get mismatched against a different occurrence's stored data.
This was a known, accepted tradeoff — flagged to the business, not raised as
a blocking concern by them.

**Change detection** (`mergeProdData()`): each row also carries a
`contentHash` (JSON of the numeric fields that matter for the calculations —
boxes, wt/box, output, eff, KG/WORKER STD, and both manpower blocks). On
each new upload:

- `rowKey` not seen before → **added**
- `rowKey` seen before, `contentHash` differs → **updated** (overwritten)
- `rowKey` seen before, `contentHash` matches → **unchanged, skipped**

Previously-stored rows are **never deleted** just because they're absent
from a new upload — only added to or updated. This favors not losing
history over strict sync-to-source-of-truth; revisit if the business ever
wants true deletion support.

---

## 6. Storage

Uses the artifact persistent storage API (`window.storage`), personal scope
(`shared: false`), single combined key `inshell-dashboard-v1` holding:

```js
{
  productMaster: [...],       // replaced wholesale on each Master file upload
  prodDataByKey: { [rowKey]: row },  // merged incrementally, see §5
  xlsbSorting: [...],         // replaced wholesale on each Daily Report upload
  payRates: [...],            // edited via Settings, persists independently
  importLog: { master: {...}, daily: {...} },  // last-upload diagnostics
}
```

Single-key storage was a deliberate choice per the storage API's own
guidance (batch related data into one key rather than many small ones) —
don't split this into per-field keys without a good reason, it'll just add
round trips.

---

## 7. Data-quality surfacing (deliberate design pattern)

Several things in the source data are genuinely broken or inconsistent
(Stock columns, FG Code join gaps, duplicate manpower columns). Rather than
silently working around these or crashing, the app is built to **surface
them visibly**:

- Upload panel shows exact row counts scanned/parsed/skipped and the
  detected date range after every upload.
- Settings → Data Quality shows the FG Code join match percentage.
- The Stock panel explicitly says the data is unavailable rather than
  showing a misleading empty chart.

**Keep this pattern going for any new data-quality issues found** — the
business has shown they want visibility into these gaps, not silent
best-effort guessing.

---

## 8. Changelog / bugs found and fixed during development

### 8.1 Hardcoded header row assumption (fixed)

Original implementation hardcoded `PD_HEADER_ROW_IDX = 6` (assuming the
`Prod data` header sat on row 7) based on an early manual inspection that
turned out to be wrong for the row-scanning approach that was actually used
downstream — the real header row is **row 4** (0-based index 3). This
silently dropped 2 real production rows per upload and was fragile against
any future layout drift (extra title rows, merged banners, etc.).

**Fix:** replaced fixed row-number constants with `findHeaderRow(ws,
columnIdx, matchText)`, which scans the first ~20 rows of a sheet for a
specific header label in a specific column and derives the data-start row
from wherever it's actually found. Applied to all three parsed sheets
(Product Master, Prod data, xlsb Prod). The old hardcoded constants
(`PM_HEADER_ROW_IDX`, `PD_HEADER_ROW_IDX`, `XLSB_HEADER_ROW_IDX`) are kept
only as fallbacks if detection fails, and a warning is surfaced to the user
if that happens.

**If you're debugging a "missing data" report from the business again**,
check the Upload panel's diagnostics block first (row counts, header row
found, date range) before assuming it's a parsing bug — it now surfaces
enough detail to usually confirm or rule that out immediately without
needing to re-run manual analysis on the file.

### 8.2 SKU-wise chart used the wrong SKU field (fixed)

Was reading `row.sku` directly from Prod data (column I), which is an
unrelated internal numeric code. Business clarified the SKU-wise pivot
should use the SKU field **from Product Master** (a pack-size label like
"10 kg", "500 gm"), joined via FG Code — same join key as everything else.
Fixed to `productMasterByCode[row.fgCode]?.sku`.

---

## 9. Known open items / things a future dev pass should consider

- **Formula direction (§3.4)** — inverted from the business's literal
  wording based on scale-matching logic, not yet explicitly re-confirmed by
  them after seeing real numbers. Worth a direct "does this look right?"
  check once they've used it with real pay rates.
- **FG Code join gap (~15% of rows)** — not fixable in code; would need the
  business to clean up the source `FG CODE` column (currently mixes real
  product codes with SAP order numbers) if they want full coverage.
- **Stock data** — currently unavailable (`#REF!` in source). Dashboard is
  ready to pick it up the moment it's populated correctly; no code change
  needed on that front unless the column position changes.
- **Bazana Sorting match rate** — only a fraction of days with logged
  manpower have a corresponding Sorting KG entry. If the business wants this
  tightened up, the fix has to happen in how they maintain the xlsb file
  (e.g. adding a product/lot reference), not in this app.
- **Row-identity edge case (§5)** — occurrence-index approach assumes stable
  row ordering between uploads; not bulletproof if the source sheet ever
  gets reordered.
- **Product Master's "Category" field** is actually a customer/channel code
  (APMC, DMART, MT, TATA…), not a product category — labeled "Category" in
  both the source file and this app to match, but worth knowing if you're
  reasoning about what it represents.
- Duplicate-looking manpower columns (`Loading/Unloading` ×2,
  `Pista Cracking` ×2) are currently always merged unconditionally. If a
  future export separates them meaningfully, this merge logic
  (`parseProdData()`, look for `loadingUnloadingA/B` and
  `pistaCrackingA/B`) needs revisiting.

---

## 10. Tech notes

- Single-file React component (`Dashboard.jsx`), default export, no required
  props — built as a Claude artifact.
- Libraries: `xlsx` (SheetJS) for parsing both `.xlsx` and `.xlsb` client-side
  (confirmed working for `.xlsb` — SheetJS's community build reads it fine,
  no special handling needed beyond `XLSX.read(buf, {type:'array',
  cellDates:true})`), `recharts` for all charts, `lucide-react` for icons.
- `cellDates: true` is used consistently so date cells arrive as JS `Date`
  objects; `toISODate()` deliberately uses `getUTC*` accessors (not local
  timezone accessors) to avoid off-by-one-day bugs regardless of the
  browser's local timezone.
- No backend — all parsing, computation, and persistence happens
  client-side via the artifact's `window.storage` API.
