const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

const oldPdCol = `const PD_COL = {
  date: 1, rmName: 2, sortingKg: 4, ipBatch: 5, partyBatch: 6, opBatch: 7,
  boxes: 9, machine: 30, fgCode: 41, output: 38,`;

const newPdCol = `const PD_COL = {
  date: 1, rmName: 2, sortingKg: 4, ipBatch: 32, partyBatch: 33, opBatch: 34,
  boxes: 36, machine: 30, fgCode: 41, output: 38,`;

dashContent = dashContent.replace(oldPdCol, newPdCol);
fs.writeFileSync(dashFile, dashContent, 'utf8');

console.log("Updated PD_COL boxes and batch columns");
