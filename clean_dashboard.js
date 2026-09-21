const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const out = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('function parseXlsbSorting(')) skip = true;
  if (skip && line.includes('function parseProductMaster(')) skip = false;
  
  if (line.includes('const handleDailyFile = async')) skip = true;
  if (skip && line.includes('return (') && line.trim() === 'return (') skip = false;

  if (skip) continue;

  if (line.includes('const [xlsbSorting, setXlsbSorting]')) continue;
  if (line.includes('setXlsbSorting(data.xlsbSorting')) continue;
  
  if (line.includes('onDailyFile={handleDailyFile}')) continue;
  if (line.includes('xlsbCount={xlsbSorting.length}')) continue;

  let modified = line;
  modified = modified.replace(/, xlsbSorting/g, '');
  modified = modified.replace(/xlsbSorting=\{xlsbSorting\} /g, '');
  modified = modified.replace(/xlsbCount=\{xlsbCount\} /g, '');
  modified = modified.replace(/ xlsbSorting: sorting, importLog: newLog/g, ' importLog: newLog');

  out.push(modified);
}

fs.writeFileSync(file, out.join('\n'), 'utf8');
