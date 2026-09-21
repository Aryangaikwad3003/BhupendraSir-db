# Manufacturing Dashboard – Project Handover Document

## 1. Project Overview
This project is a completely client-side, browser-based analytics dashboard designed to visualize manufacturing efficiency, manpower utilization, and production output. It is built to operate without a traditional backend database. Instead, it parses heavy Excel files locally and caches the extracted data in the user's browser for instant, persistent access across sessions.

## 2. Architecture & Tech Stack
Because this is a Single Page Application (SPA), it can be hosted statically (e.g., Vercel, Netlify, AWS S3) with zero server-side maintenance required.

* **Framework:** React.js (via Vite)
* **Styling & Icons:** Inline CSS / standard React patterns, `lucide-react` for iconography.
* **Charting:** `recharts` (Responsive, customizable SVG charts).
* **Data Parsing:** `xlsx` (SheetJS) to read and parse Excel workbooks.
* **Background Processing:** Standard JavaScript **Web Workers** (`worker.js`). Used to offload the heavy Excel parsing (up to 24MB+) from the main thread, ensuring the UI remains responsive during uploads.
* **Local Storage (Database):** `localforage` (IndexedDB wrap). Used to persistently store parsed Excel rows in the browser so users do not need to re-upload the file on every page refresh.

## 3. Data Inputs
The application takes a single primary input: **The Master Excel File**.

### Key Sheets Processed:
1. **Product Master:** 
   * Provides mapping for Product Code, Category, Machine Name, and SKU details.
   * Serves as the lookup table to enrich production data.
2. **Prod data:** 
   * Contains the daily granular production logs.
   * Key columns extracted: Date, RM Name, Output (kg), KG/Worker STD (Standard Benchmark), Machine, and manpower allocation across various processing stations (e.g., Roaster, Packing, Blanching, Sorting).
3. *(Optional/Historical)* **Pay rates:**
   * Used for calculating weighted manpower costs/equivalents over time.

### Upload & Sync Flow
* When the user uploads the Master File, `Dashboard.jsx` passes the file buffer to `worker.js`.
* The worker parses the rows, maps the specific column indices (defined in `PD_COL` and `PM_COL`), and computes unique row hashes.
* It returns the sanitized data to the main thread, which uses `localforage` to intelligently merge the new rows with the existing cached data (preventing duplicates).

## 4. Key Outputs & Visualizations
The dashboard translates the raw Excel rows into several interactive analytical views:

* **High-Level KPIs:** Top banner displaying Total Output, Total Equivalent Manpower, Overall Actual kg/worker, and Overall Target variance.
* **Regular Production Efficiency:** 
   * **Month-wise Trend (Line Chart):** Tracks Actual vs. STD Kg/Worker across chronological months, adapting to filters.
   * **Ranked Bar Charts:** Compares efficiencies grouped by Product, SKU, Machine, or Customer Category.
* **Loading & Unloading (Gents):** Dedicated month-wise trend line tracking output efficiency specifically for the loading/unloading manpower.
* **Bazana Sorting:** Dedicated month-wise trend line isolating sorting efficiencies (based on pre-sorting RM entries and dedicated bazana manpower).
* **Production Visuals:** Line charts detailing pure Output (kg) trends over time, segmented by Machine, Category, and Product.

## 5. Developer Notes & Maintenance
* **Column Drift:** The biggest point of failure in this application is Excel column shifting. The columns are hard-mapped by their 0-based index in `worker.js` and `Dashboard.jsx` (e.g., `kgWorkerStd: 46`). If the operations team adds or removes columns in the Master Excel template, the tech team **must** update the `PD_COL` or `PM_COL` index maps in the code to match the new layout.
* **Cache Clearing:** If corrupted data enters the IndexedDB due to a column mapping error, users must click the red "Clear All Imported Data" button in the Settings panel to wipe the local database before re-uploading the corrected file.
* **No Backend Needed:** As long as only one person (or a few isolated users) needs to view their own local uploads, no backend API is required. If centralized data syncing becomes necessary in the future, the `localforage` logic would need to be replaced with standard API fetch calls to a backend SQL/NoSQL database.

## 6. Setup & Run Commands
To run the project locally or build it for production, use the following commands:

### Install Dependencies
\ash
npm install
\\n
### Run Local Development Server
\ash
npm run dev
\\n*(This will start the local Vite server, typically accessible at http://localhost:5173)*

### Build for Production
\ash
npm run build
\\n*(This will compile the optimized static assets into the dist/ directory, which can be uploaded to any static hosting provider like Vercel, Netlify, AWS S3, or GitHub Pages)*

### Preview Production Build Locally
\ash
npm run preview
\\n