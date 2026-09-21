const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

const oldSettings = `<button onClick={save} style={{ ...btnPrimary }}>{savedFlash ? 'Saved ✓' : 'Save rates'}</button>
        </div>
      </Section>

      <Section title="Data on file" icon={Database}>`;

const newSettings = `<button onClick={save} style={{ ...btnPrimary }}>{savedFlash ? 'Saved ✓' : 'Save rates'}</button>
        </div>
      </Section>

      <Section title="Data Reset" icon={AlertTriangle}>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
          If charts are showing incorrect phantom values due to recent column shifts in the Excel file, you can completely wipe the dashboard's saved data and start fresh. Your pay rates will be kept.
        </div>
        <button onClick={async () => {
          if (confirm('Are you sure you want to clear all imported production data? You will need to re-upload the Master File.')) {
            const current = await window.storage.get('inshell-dashboard-v1');
            const data = current ? JSON.parse(current.value) : {};
            await window.storage.set('inshell-dashboard-v1', JSON.stringify({ payRates: data.payRates || [] }));
            window.location.reload();
          }
        }} style={{ background: '#DC2626', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          Clear All Imported Data
        </button>
      </Section>

      <Section title="Data on file" icon={Database}>`;

if (dashContent.includes(oldSettings)) {
    dashContent = dashContent.replace(oldSettings, newSettings);
    fs.writeFileSync(dashFile, dashContent, 'utf8');
    console.log("Added Reset button to Settings");
} else {
    console.log("Could not find Settings insertion point");
}
