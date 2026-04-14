# Drutex MS SQL Database Extraction Guide

This document captures the planning, steps, and execution performed to extract Drutex Dealer database logic and terminology into the project. It serves as a permanent reference so that the extraction process can be repeated or modified without starting from scratch.

## 1. Planning & Assessment

The objective was to connect to the local Drutex Dealer configuration application and map out the data structures, specifically to extract logic/terminology and current pricing information. 
- The target database path originally identified from the desktop shortcut `cversion\caMainU.exe` pointed to an MS SQL Server `LocalDB` instance.
- Using PowerShell query `Get-Service -Name *SQL*`, we discovered the database instance name: `.\CANTOR2019`.
- The database name itself is `DRUTEX_DEALER` (found via `sqlcmd -S .\CANTOR2019 -E -Q "SELECT name FROM sys.databases"`).

The database consists of **625 tables**. Analysis showed that the logic mapping for the configurator lies heavily inside tables grouped by the prefix `CUSTOM_` (e.g. `CUSTOM_OKNA_KOLORY_AKCESORIA_PVC`), alongside large base tables for items and pricing (`ARTIKEL`, `PREISE`, `FARBEN`). 

## 2. Extraction Scripts & Dependencies

To extract the configuration logic automatically into JSON models that the JavaScript React frontend could use, we built a script using Node.js.

### Prerequisites (Installed)
We installed two NPM packages:
```bash
npm install mssql msnodesqlv8
```
> [!IMPORTANT]
> The `msnodesqlv8` package is crucial because it provides the native C++ bindings required for Microsoft SQL Server Windows Authentication when running `Integrated Security=True` or `trustedConnection=true` on Windows nodes.

### Extraction Script (`scripts/exportDrutexDb.mjs`)
The Node.js script connects directly to the `.\CANTOR2019` instance and queries the tables dynamically. It finds all `CUSTOM_%` logic tables and bundles them into a single `drutex_custom_tables.json` file. It then does direct dumps of other base configuration tables.

```javascript
import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8' // Use the V8 driver for local integrated security
};

// ... Fetching Logic ...
```

## 3. Results & Generated Output

Running the script successfully generated the following artifacts in our `scripts/` directory:

1. **`drutex_custom_tables.json`:** The master dictionary of all 39 `CUSTOM_*` tables (containing rules for door/window/shutter limits, available colors per system, glass types, handle types, etc.).
2. **`drutex_preise.json`:** The detailed pricing brackets and base price rules.
3. **`drutex_preisgruppe.json`:** Metadata linking products to specific pricing groups.
4. **`drutex_artpreise.json`:** Article-specific pricing overrides/tables.
5. **`drutex_artikel.json`:** Master list of all articles and parts.
6. **`drutex_farben.json`:** The centralized dictionary of Drutex color systems and mappings.
7. **`drutex_texte.json`:** Basic system texts, descriptions, and dictionary strings.

## 4. Next Steps & Usage

Whenever the Drutex Dealer application updates or pulls new prices from the factory:
1. Run `node scripts/exportDrutexDb.mjs`
2. The JSON files will be updated with the live definitions.
3. The frontend components can directly import these JSON objects to enforce standard configurations and display true current pricing/color configurations.

## 5. Image & DXF Asset Extraction

In addition to logic and pricing, the database contains extensive references to image and DXF (CAD) assets used by the application, mostly pointing to a `Bilder` directory or similar folder structure.

To extract these references and build an inventory of required assets for the storefront configurator, a dedicated script `scripts/extractAllImageLists.mjs` was created.

### Extraction Script (`scripts/extractAllImageLists.mjs`)
The script scans multiple tables known to contain visual assets, such as `ART`, `SBMAKRO`, `FELDVORB`, `SPRART`, and the `CUSTOM_%` component files. 

It executes aggregate queries (e.g., `SELECT DISTINCT DATEINAME FROM ART`) and merges the results into a unified, deduplicated list.

### Generated Artifacts
The extraction yields:
- **`drutex_image_list_all.json`**: Contains an array of `images` (mostly `.jpg`, `.png`, `.bmp`) and `dxfs` (for `.dxf` CAD representations). Over 2,000 distinct product and component imagery paths were extracted.

These lists will be used as a manifest to fetch or map the corresponding actual image files into the modern application's CDN or static public folder.
