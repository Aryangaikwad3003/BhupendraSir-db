const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldEffChart = `      <Section title={\`Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : 'Category / Customer'}\`} icon={Users}>
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 10 }}>`;

const newEffChart = `      <Section title={\`Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : 'Category / Customer'}\`} icon={Users}>
        <div style={{ width: '100%', maxHeight: 450, overflowY: 'auto', overflowX: 'auto', paddingBottom: 10 }}>`;

if (content.includes(oldEffChart)) {
    content = content.replace(oldEffChart, newEffChart);
} else {
    console.log("Could not find Efficiency chart container");
}

fs.writeFileSync(file, content, 'utf8');
console.log("Updated Efficiency chart with vertical scroll");
