import sql from 'mssql/msnodesqlv8.js';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually for test script
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2].replace(/(^"|"$)/g, '');
    }
});

const sqlConfig = {
    server: 'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
    },
    driver: 'msnodesqlv8'
};

async function checkLinks() {
    console.log("=== B.L.A.S.T Phase 2: LINK Handshake ===");

    // 1. Check Cantor SQL
    try {
        console.log("Checking Cantor DB Connection...");
        await sql.connect(sqlConfig);
        console.log("[\u2713] Cantor DB Local SQL Connected Successfully!");
        await sql.close();
    } catch (e) {
        console.error("[x] Cantor DB Integration Failed:", e.message);
    }

    // 2. Check Supabase
    try {
        console.log("\nChecking Supabase Connection...");
        const supabaseUrl = env['VITE_SUPABASE_URL'];
        const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials in .env.local");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        // Simple ping to ensure we can reach it (fetching time or simple table)
        const { error } = await supabase.from('supplier_products').select('id').limit(1);
        if (error && error.code !== '42P01' && !error.code.startsWith('PGRST')) { 
            // 42P01 is relation undefined, PGRST errors are schema cache issues meaning connection works but table doesn't exist, which is fine for handshake
             console.error("[x] Supabase Verification return an error:", error.code, error.message);
        } else {
             console.log("[\u2713] Supabase Link Verified Successfully! (Code: " + (error ? error.code : "None") + ")");
        }
    } catch(e) {
         console.error("[x] Supabase Integration Failed:", e.message);
    }
}

checkLinks();
