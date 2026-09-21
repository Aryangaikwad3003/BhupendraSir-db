const fs = require('fs');

// Update worker.js
const workerFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/worker.js';
let workerContent = fs.readFileSync(workerFile, 'utf8');

const oldBaseKeyWorker = `const baseKey = [iso, fgCodeStr, machine, output].join('|');`;
const newBaseKeyWorker = `
        const boxes = num(r[PD_COL.boxes]);
        const ipBatch = r[PD_COL.ipBatch] || '';
        const opBatch = r[PD_COL.opBatch] || '';
        const baseKey = [iso, fgCodeStr, machine, boxes, output, ipBatch, opBatch].join('|');`;

workerContent = workerContent.replace(oldBaseKeyWorker, newBaseKeyWorker);
fs.writeFileSync(workerFile, workerContent, 'utf8');

// Update Dashboard.jsx
const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

const oldPdCol = `const PD_COL = {
  date: 1, rmName: 2, sortingKg: 4,
  machine: 30, fgCode: 41, output: 38,`;

const newPdCol = `const PD_COL = {
  date: 1, rmName: 2, sortingKg: 4, ipBatch: 5, partyBatch: 6, opBatch: 7,
  boxes: 9, machine: 30, fgCode: 41, output: 38,`;

dashContent = dashContent.replace(oldPdCol, newPdCol);
fs.writeFileSync(dashFile, dashContent, 'utf8');

console.log("Updated rowKey to match original");
