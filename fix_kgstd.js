const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
const workerFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/worker.js';

let dash = fs.readFileSync(dashFile, 'utf8');
dash = dash.replace('rmName: 2', 'rmName: 29');
dash = dash.replace('output: 38,', 'output: 38, kgWorkerStd: 46,');
fs.writeFileSync(dashFile, dash);

let worker = fs.readFileSync(workerFile, 'utf8');
worker = worker.replace('rmName: 2', 'rmName: 29');
worker = worker.replace('output: 38,', 'output: 38, kgWorkerStd: 46,');

const oldWorkerCode = `        const sortingKg = num(r[PD_COL.sortingKg]);
        const rmName = r[PD_COL.rmName] ? String(r[PD_COL.rmName]).trim() : '';

        
        const boxes = num(r[PD_COL.boxes]);`;
const newWorkerCode = `        const sortingKg = num(r[PD_COL.sortingKg]);
        const rmName = r[PD_COL.rmName] ? String(r[PD_COL.rmName]).trim() : '';
        const kgWorkerStd = num(r[PD_COL.kgWorkerStd]);
        
        const boxes = num(r[PD_COL.boxes]);`;

worker = worker.replace(oldWorkerCode, newWorkerCode);

const oldRowPush = `        const row = {
          rowKey, date: iso, month: toMonthKey(iso), rmName, machine, 
          fgCode: fgCodeStr, output, sortingKg, ladies, gents,
        };
        row.contentHash = JSON.stringify([row.output, row.sortingKg, row.ladies, row.gents, row.rmName]);`;
const newRowPush = `        const row = {
          rowKey, date: iso, month: toMonthKey(iso), rmName, machine, 
          fgCode: fgCodeStr, output, sortingKg, kgWorkerStd, ladies, gents,
        };
        row.contentHash = JSON.stringify([row.output, row.sortingKg, row.kgWorkerStd, row.ladies, row.gents, row.rmName]);`;

worker = worker.replace(oldRowPush, newRowPush);
fs.writeFileSync(workerFile, worker);

console.log("Updated rmName and kgWorkerStd");
