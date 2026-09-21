const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHandleMasterFile = `  const handleMasterFile = async (file) => {
    setBusy(true); setErrorMsg(null);
    try {
      const buf = await file.arrayBuffer();
      await new Promise(r => setTimeout(r, 100)); // Yield to prevent unresponsiveness
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      const pmResult = parseProductMaster(wb);
      const pdResult = parseProdData(wb);
      const pm = pmResult.rows, pd = pdResult.rows;
      if (!pmResult.diag.found) setErrorMsg('Could not locate the "Product Code" header in Product Master — check the sheet name and layout haven\\'t changed.');
      if (!pdResult.diag.found) setErrorMsg('Could not locate the "Date" header in Prod data — check the sheet name and layout haven\\'t changed.');
      const { merged, added, updated, unchanged } = mergeProdData(prodDataByKey, pd);
      const newLog = {
        ...(importLog || {}),
        master: {
          fileName: file.name, at: new Date().toISOString(), added, updated, unchanged,
          productCount: pm.length, diag: pdResult.diag, pmDiag: pmResult.diag,
        },
      };
      setProductMaster(pm);
      setProdDataByKey(merged);
      setImportLog(newLog);
      await persist({ productMaster: pm, prodDataByKey: merged, importLog: newLog });
      setTab('efficiency');
    } catch (e) {
      console.error(e);
      setErrorMsg('Could not read that Master file.');
    }
    setBusy(false);
  };`;

const newHandleMasterFile = `  const handleMasterFile = async (file) => {
    setBusy(true); setErrorMsg(null);
    try {
      const buf = await file.arrayBuffer();
      
      const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
      worker.postMessage({ buf, PM_COL, PD_COL, PM_HEADER_ROW_IDX, PD_HEADER_ROW_IDX });
      
      worker.onmessage = async (e) => {
        if (!e.data.success) {
          setErrorMsg('Worker Error: ' + e.data.error);
          setBusy(false);
          return;
        }
        
        const { pmResult, pdResult } = e.data;
        const pm = pmResult.rows, pd = pdResult.rows;
        
        if (!pmResult.diag.found) setErrorMsg('Could not locate the "Product Code" header in Product Master — check the sheet name and layout haven\\'t changed.');
        if (!pdResult.diag.found) setErrorMsg('Could not locate the "Date" header in Prod data — check the sheet name and layout haven\\'t changed.');
        
        const { merged, added, updated, unchanged } = mergeProdData(prodDataByKey, pd);
        const newLog = {
          ...(importLog || {}),
          master: {
            fileName: file.name, at: new Date().toISOString(), added, updated, unchanged,
            productCount: pm.length, diag: pdResult.diag, pmDiag: pmResult.diag,
          },
        };
        
        setProductMaster(pm);
        setProdDataByKey(merged);
        setImportLog(newLog);
        await persist({ productMaster: pm, prodDataByKey: merged, importLog: newLog });
        setTab('efficiency');
        setBusy(false);
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        setErrorMsg('Could not process the file: ' + err.message);
        setBusy(false);
        worker.terminate();
      };

    } catch (e) {
      console.error(e);
      setErrorMsg('Could not read that Master file.');
      setBusy(false);
    }
  };`;

if (content.includes(oldHandleMasterFile)) {
    content = content.replace(oldHandleMasterFile, newHandleMasterFile);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated handleMasterFile with Web Worker");
} else {
    console.log("Could not find old handleMasterFile signature");
}
