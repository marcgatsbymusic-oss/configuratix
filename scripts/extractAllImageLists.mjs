import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs/promises';

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

const tablesToQueries = [
    { table: 'ART', column: 'DATEINAME', query: "SELECT DISTINCT DATEINAME FROM ART WHERE DATEINAME IS NOT NULL AND DATEINAME != ''" },
    { table: 'SBMAKRO', column: 'DATEINAME', query: "SELECT DISTINCT DATEINAME FROM SBMAKRO WHERE DATEINAME IS NOT NULL AND DATEINAME != ''" },
    { table: 'FELDVORB', column: 'SPRBILD', query: "SELECT DISTINCT SPRBILD FROM FELDVORB WHERE SPRBILD IS NOT NULL AND SPRBILD != ''" },
    { table: 'SPRART', column: 'SPBILDTYP', query: "SELECT DISTINCT SPBILDTYP FROM SPRART WHERE SPBILDTYP IS NOT NULL AND SPBILDTYP != ''" },
    { table: 'SPRBAUM', column: 'SPRBILD', query: "SELECT DISTINCT SPRBILD FROM SPRBAUM WHERE SPRBILD IS NOT NULL AND SPRBILD != ''" },
    { table: 'CUSTOM_ROLETY_OGRANICZNIKI', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_OGRANICZNIKI WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_WARIANTY_OKL_PROW', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_WARIANTY_OKL_PROW WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_WARIANTY_OKL_SKRZ', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_WARIANTY_OKL_SKRZ WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_WARIANT_ZABUDOWY', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_WARIANT_ZABUDOWY WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_WYJSCIE_KABLA', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_WYJSCIE_KABLA WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_WYJSCIE_KORBY', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_WYJSCIE_KORBY WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_WYJSCIE_LINKI_PASKA', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_WYJSCIE_LINKI_PASKA WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'CUSTOM_ROLETY_ZABEZPIECZENIE', column: 'PLIK_GRAFICZNY', query: "SELECT DISTINCT PLIK_GRAFICZNY FROM CUSTOM_ROLETY_ZABEZPIECZENIE WHERE PLIK_GRAFICZNY IS NOT NULL AND PLIK_GRAFICZNY != ''" },
    { table: 'PRODUKTDESIGN', column: 'GRAFIK', query: "SELECT DISTINCT GRAFIK FROM PRODUKTDESIGN WHERE GRAFIK IS NOT NULL AND GRAFIK != ''" },
    { table: 'VORBGRUPPE', column: 'GRAFIK', query: "SELECT DISTINCT GRAFIK FROM VORBGRUPPE WHERE GRAFIK IS NOT NULL AND GRAFIK != ''" },
    { table: 'ARTKL', column: 'GRAFIK', query: "SELECT DISTINCT GRAFIK FROM ARTKL WHERE GRAFIK IS NOT NULL AND GRAFIK != ''" },
    { table: 'BESCHLAGSPAKET', column: 'GRAFIK', query: "SELECT DISTINCT GRAFIK FROM BESCHLAGSPAKET WHERE GRAFIK IS NOT NULL AND GRAFIK != ''" }
];

async function extractLists() {
    try {
        let pool = await sql.connect(sqlConfig);
        console.log("Connected to DB.");

        let allFilesRaw = [];
        let errorTables = [];

        for (const t of tablesToQueries) {
            try {
                const res = await pool.request().query(t.query);
                const items = res.recordset.map(r => r[t.column]);
                allFilesRaw.push(...items);
            } catch (e) {
                console.log(`Failed for ${t.table}.${t.column}`);
                errorTables.push(t.table);
            }
        }

        const uniqueFiles = [...new Set(allFilesRaw)].sort();
        
        let images = [];
        let dxfs = [];
        
        for (const file of uniqueFiles) {
            if (!file) continue;
            
            const lowerFile = file.toLowerCase();
            if (lowerFile.endsWith('.dxf')) {
                dxfs.push(file);
            } else {
                images.push(file);
            }
        }
        
        await fs.writeFile('drutex_image_list_all.json', JSON.stringify({images, dxfs}, null, 2));
        console.log(`Extracted ${images.length} images/refs and ${dxfs.length} DXF files. Saved to drutex_image_list_all.json`);
        
        pool.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

extractLists();
