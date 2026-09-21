const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add LabelList to imports
content = content.replace(
  /Legend, ResponsiveContainer, ReferenceLine\n\} from 'recharts';/,
  "Legend, ResponsiveContainer, ReferenceLine, LabelList\n} from 'recharts';"
);

// 2. Efficiency Panel Margins
content = content.replace(
  /<BarChart data=\{regularStats\} margin=\{\{ top: 16, right: 20, left: 0, bottom: 20 \}\}>/,
  `<BarChart data={regularStats} margin={{ top: 24, right: 20, left: 0, bottom: 20 }}>`
);

// 3. Efficiency Panel Labels
content = content.replace(
  /<Bar dataKey="std" name="STD" fill="#CBD5E1" radius=\{\[3, 3, 0, 0\]\} \/>/,
  `<Bar dataKey="std" name="STD" fill="#CBD5E1" radius={[3, 3, 0, 0]}>
              <LabelList dataKey="std" position="top" formatter={(v) => fmt(v, 0)} style={{ fontSize: 10, fill: '#64748B' }} />
            </Bar>`
);
content = content.replace(
  /<Bar dataKey="actual" name="Actual" fill="#2563EB" radius=\{\[3, 3, 0, 0\]\} \/>/,
  `<Bar dataKey="actual" name="Actual" fill="#2563EB" radius={[3, 3, 0, 0]}>
              <LabelList dataKey="actual" position="top" formatter={(v) => fmt(v, 0)} style={{ fontSize: 10, fill: '#1E40AF' }} />
            </Bar>`
);

// 4. Loading & Unloading Margins
content = content.replace(
  /<LineChart data=\{loadingUnloadingStats\} margin=\{\{ top: 8, right: 20, left: 0, bottom: 5 \}\}>/,
  `<LineChart data={loadingUnloadingStats} margin={{ top: 24, right: 24, left: 0, bottom: 5 }}>`
);

// 5. Loading & Unloading Labels
content = content.replace(
  /<Line type="monotone" dataKey="actual" name="Actual KG\/Worker" stroke="#0891B2" strokeWidth=\{2\.5\} dot=\{\{ r: 4 \}\} \/>/,
  `<Line type="monotone" dataKey="actual" name="Actual KG/Worker" stroke="#0891B2" strokeWidth={2.5} dot={{ r: 4 }}>
              <LabelList dataKey="actual" position="top" formatter={(v) => fmt(v, 0)} style={{ fontSize: 10.5, fill: '#0891B2', fontWeight: 600 }} />
            </Line>`
);

// 6. Bazana Sorting Margins
content = content.replace(
  /<LineChart data=\{bazanaStats\.monthly\} margin=\{\{ top: 8, right: 20, left: 0, bottom: 5 \}\}>/,
  `<LineChart data={bazanaStats.monthly} margin={{ top: 24, right: 24, left: 0, bottom: 5 }}>`
);

// 7. Bazana Sorting Labels
content = content.replace(
  /<Line type="monotone" dataKey="actual" name="Actual KG\/Worker" stroke="#D97706" strokeWidth=\{2\.5\} dot=\{\{ r: 4 \}\} \/>/,
  `<Line type="monotone" dataKey="actual" name="Actual KG/Worker" stroke="#D97706" strokeWidth={2.5} dot={{ r: 4 }}>
              <LabelList dataKey="actual" position="top" formatter={(v) => fmt(v, 0)} style={{ fontSize: 10.5, fill: '#D97706', fontWeight: 600 }} />
            </Line>`
);

// 8. Monthly Trend Margins
content = content.replace(
  /<LineChart data=\{monthlyTrend\} margin=\{\{ top: 16, right: 24, left: 16, bottom: 8 \}\}>/,
  `<LineChart data={monthlyTrend} margin={{ top: 24, right: 30, left: 16, bottom: 8 }}>`
);

// 9. Monthly Trend Labels
content = content.replace(
  /<Line type="monotone" dataKey="output" name="Output \(kg\)" stroke="#2563EB" strokeWidth=\{2\.5\} dot=\{\{ r: 4 \}\} \/>/,
  `<Line type="monotone" dataKey="output" name="Output (kg)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }}>
              <LabelList dataKey="output" position="top" formatter={(v) => fmt(v, 0)} style={{ fontSize: 10.5, fill: '#2563EB', fontWeight: 600 }} />
            </Line>`
);

// 10. RankedBarChart Margins
content = content.replace(
  /<BarChart data=\{data\} layout="vertical" margin=\{\{ top: 12, right: 24, left: 16, bottom: 8 \}\}>/,
  `<BarChart data={data} layout="vertical" margin={{ top: 12, right: 54, left: 16, bottom: 8 }}>`
);

// 11. RankedBarChart Labels
content = content.replace(
  /<Bar dataKey="value" fill=\{color\} radius=\{\[0, 4, 4, 0\]\} \/>/,
  `<Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="value" position="right" formatter={(v) => fmt(v, 0)} style={{ fontSize: 10.5, fill: '#64748B', fontWeight: 500 }} />
          </Bar>`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Done updating Dashboard.jsx");
