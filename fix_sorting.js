const fs = require('fs');
const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let c = fs.readFileSync(dashFile, 'utf8');

const oldLine = `    })).filter(m => m.qty > 0).sort((a, b) => a.name.localeCompare(b.name));`;
const newLine = `    })).filter(m => m.qty > 0);`;

const oldMap = `    return Object.values(byMonth).map(m => ({`;
const newMap = `    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({`;

c = c.replace(oldLine, newLine);
c = c.replace(oldMap, newMap);

fs.writeFileSync(dashFile, c, 'utf8');
console.log("Fixed sorting");
