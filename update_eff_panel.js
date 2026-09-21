const fs = require('fs');
const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let c = fs.readFileSync(dashFile, 'utf8');

const effPanelSig = `function EfficiencyPanel({ prodData, payRates, productMasterByCode }) {`;
const effPanelStateOld = `  const months = useMemo(() => [...new Set(prodData.map(r => r.month))].sort(), [prodData]);
  const [month, setMonth] = useState('all');
  const [groupBy, setGroupBy] = useState('product'); // product | machine | category`;
const effPanelStateNew = `  const months = useMemo(() => [...new Set(prodData.map(r => r.month))].sort(), [prodData]);
  const machines = useMemo(() => [...new Set(prodData.map(r => r.machine).filter(Boolean))].sort(), [prodData]);
  const categories = useMemo(() => {
    const cats = new Set();
    Object.values(productMasterByCode).forEach(pm => { if (pm.category) cats.add(pm.category); });
    return [...cats].sort();
  }, [productMasterByCode]);
  const products = useMemo(() => [...new Set(prodData.map(r => productMasterByCode[r.fgCode]?.product || r.rmName).filter(Boolean))].sort(), [prodData, productMasterByCode]);

  const [month, setMonth] = useState('all');
  const [machine, setMachine] = useState('all');
  const [category, setCategory] = useState('all');
  const [product, setProduct] = useState('all');
  const [groupBy, setGroupBy] = useState('product');`;

c = c.replace(effPanelStateOld, effPanelStateNew);

const filteredOld = `const filtered = useMemo(() => month === 'all' ? prodData : prodData.filter(r => r.month === month), [prodData, month]);`;
const filteredNew = `const filtered = useMemo(() => prodData.filter(r => {
    if (month !== 'all' && r.month !== month) return false;
    if (machine !== 'all' && r.machine !== machine) return false;
    if (product !== 'all' && (productMasterByCode[r.fgCode]?.product || r.rmName) !== product) return false;
    if (category !== 'all') {
      const pm = productMasterByCode[r.fgCode];
      if (!pm || pm.category !== category) return false;
    }
    return true;
  }), [prodData, month, machine, product, category, productMasterByCode]);`;
c = c.replace(filteredOld, filteredNew);

const returnStatsOld = `return Object.values(groups).map(g => ({`;
const regStatsMonthNew = `
  const regularStatsMonthly = useMemo(() => {
    const byMonth = {};
    for (const row of filtered) {
      const monthKey = row.month;
      if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0, exactStd: 0 };
      const w = getWeights(payRates, row.month);
      const ladiesRegular = row.ladies.total - row.ladies.bazanaSorting;
      const gentsRegular = row.gents.total - row.gents.bazanaSorting - row.gents.loadingUnloading;
      const weightedManpower = Math.max(0, ladiesRegular) * w.ladies + Math.max(0, gentsRegular) * w.gents;
      byMonth[monthKey].weightedManpower += weightedManpower;
      byMonth[monthKey].qty += row.output;
      if (row.kgWorkerStd && row.kgWorkerStd > 0) { byMonth[monthKey].exactStd = row.kgWorkerStd; }
    }
    return Object.values(byMonth).map(m => ({
      name: monthLabel(m.month),
      actual: m.weightedManpower > 0 ? Math.round(m.qty / m.weightedManpower) : 0,
      std: Math.round(m.exactStd || 0),
      qty: m.qty,
    })).filter(m => m.qty > 0).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, payRates]);
  
  return Object.values(groups).map(g => ({`;
c = c.replace(returnStatsOld, regStatsMonthNew);

const filterBarOld = `<FilterBar month={month} setMonth={setMonth} months={months} groupBy={groupBy} setGroupBy={setGroupBy} />`;
const filterBarNew = `<FilterBar month={month} setMonth={setMonth} months={months} machine={machine} setMachine={setMachine} machines={machines} category={category} setCategory={setCategory} categories={categories} product={product} setProduct={setProduct} products={products} groupBy={groupBy} setGroupBy={setGroupBy} />`;
c = c.replace(filterBarOld, filterBarNew);

const effRenderOld = `<Section title={\`Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : groupBy === 'sku' ? 'SKU' : 'Category / Customer'}\`} icon={Users}>`;
const effRenderNew = `<Section title="Regular Production — Month-wise Trend" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={regularStatsMonthly} margin={{ top: 8, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11.5 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [fmt(v, 0), n === 'actual' ? 'Actual' : 'STD']} />
            <Legend />
            <Line type="monotone" dataKey="actual" name="Actual KG/Worker" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }}>
               <LabelList dataKey="actual" position="top" fontSize={11} fill="#1E40AF" />
            </Line>
            <Line type="monotone" dataKey="std" name="STD KG/Worker" stroke="#CBD5E1" strokeWidth={2.5} dot={{ r: 4 }}>
               <LabelList dataKey="std" position="bottom" fontSize={11} fill="#64748B" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </Section>
      <Section title={\`Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : groupBy === 'sku' ? 'SKU' : 'Category / Customer'}\`} icon={Users}>`;
c = c.replace(effRenderOld, effRenderNew);

const filterBarDefOld = `function FilterBar({ month, setMonth, months, groupBy, setGroupBy }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Dropdown label="Month" value={month} onChange={setMonth} options={[['all', 'All months'], ...months.map(m => [m, monthLabel(m)])]} />
      <Dropdown label="Group" value={groupBy} onChange={setGroupBy} options={[['product', 'By Product'], ['machine', 'By Machine'], ['category', 'By Category'], ['sku', 'By SKU (FG Code)']]} />
    </div>
  );
}`;
const filterBarDefNew = `function FilterBar({ month, setMonth, months, machine, setMachine, machines, category, setCategory, categories, product, setProduct, products, groupBy, setGroupBy }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Dropdown label="Month" value={month} onChange={setMonth} options={[['all', 'All months'], ...months.map(m => [m, monthLabel(m)])]} />
      <Dropdown label="Product" value={product} onChange={setProduct} options={[['all', 'All products'], ...products.map(p => [p, p])]} />
      <Dropdown label="Machine" value={machine} onChange={setMachine} options={[['all', 'All machines'], ...machines.map(m => [m, m])]} />
      <Dropdown label="Category" value={category} onChange={setCategory} options={[['all', 'All categories'], ...categories.map(c => [c, c])]} />
      <Dropdown label="Group" value={groupBy} onChange={setGroupBy} options={[['product', 'By Product'], ['machine', 'By Machine'], ['category', 'By Category'], ['sku', 'By SKU (FG Code)']]} />
    </div>
  );
}`;
c = c.replace(filterBarDefOld, filterBarDefNew);

fs.writeFileSync(dashFile, c, 'utf8');
console.log("Updated EfficiencyPanel to include line charts and filters");
