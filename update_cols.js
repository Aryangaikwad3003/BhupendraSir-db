const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const newCols = `const PD_COL = {
  date: 1,
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
};`;

content = content.replace(/const PD_COL = \{[\s\S]*? total: 57,\n  \},\n\};/, newCols);

fs.writeFileSync(file, content, 'utf8');
console.log("Done updating columns");
