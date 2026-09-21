const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /function UploadPanel\(\{ busy, onMasterFile, onDailyFile, importLog, masterInputRef, dailyInputRef, productMasterCount, prodDataCount, xlsbCount \}\) \{/,
  'function UploadPanel({ busy, onMasterFile, importLog, masterInputRef, productMasterCount, prodDataCount }) {'
);

content = content.replace(
  /<UploadCard\s*title="Daily Report.*?\s*subtitle="Bazana Sorting KG reference \(\.xlsb\)".*?\s*accept="\.xlsb,\.xlsx,\.xls".*?\s*inputRef=\{dailyInputRef\}.*?\s*busy=\{busy\}.*?\s*onFile=\{onDailyFile\}.*?\s*stat=\{`\$\{xlsbCount\}.*?\s*log=\{importLog\?\.daily\}.*?\/>/ms,
  `{!prodDataCount && (
            <div style={{ padding: 24, background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center' }}>
              <Package size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>No daily report needed</div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>Bazana Sorting stats are now pulled directly from the Master File</div>
            </div>
          )}`
);

content = content.replace(
  /\{importLog\?\.daily && \([\s\S]*?<\/div>\n      \)\}/,
  ''
);

fs.writeFileSync(file, content, 'utf8');
console.log("Done fixing UploadPanel");
