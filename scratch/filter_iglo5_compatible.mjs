import fs from 'fs/promises';

async function run() {
    try {
        const csvContent = await fs.readFile('scratch/window_types_catalog.csv', 'utf-8');
        const lines = csvContent.split('\n');
        const header = lines[0];
        
        // Define IGLO 5 compatible prefixes
        // F = Windows / Balcony doors
        // D = Doors
        // P / PP = PSK
        // B = Intermediate profiles / transoms
        const compatiblePrefixes = ['F', 'D', 'P', 'PP', 'B'];
        const incompatiblePrefixes = ['BR', 'BS', 'C', 'CV', 'G', 'H', 'HS', 'HST', 'SG', 'SL', 'SLE', 'W', 'Z', 'ZW', 'ZAL'];

        const filteredCsvLines = [header];
        let compatibleCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Extract the code (first column)
            // Handle possible quotes around code, though in our CSV they are unquoted
            const firstComma = line.indexOf(',');
            if (firstComma === -1) continue;
            const code = line.substring(0, firstComma);

            // Determine if compatible
            // Must start with one of the compatible prefixes and NOT start with one of the incompatible prefixes
            // (e.g. 'FS' or 'F' is fine, but 'HST' or 'H' starts with H, which is in incompatible list)
            let isCompatible = false;
            for (const prefix of compatiblePrefixes) {
                if (code.startsWith(prefix)) {
                    // Check if it matches an incompatible prefix that is longer (e.g. 'WJ' or 'W' vs 'WJDW')
                    let isExcluded = false;
                    for (const incPrefix of incompatiblePrefixes) {
                        if (code.startsWith(incPrefix)) {
                            isExcluded = true;
                            break;
                        }
                    }
                    if (!isExcluded) {
                        isCompatible = true;
                        break;
                    }
                }
            }

            if (isCompatible) {
                filteredCsvLines.push(line);
                compatibleCount++;
            }
        }

        const filteredCsvContent = filteredCsvLines.join('\n');
        await fs.writeFile('scratch/window_types_catalog_iglo5.csv', filteredCsvContent, 'utf-8');

        // Also filter the TXT file
        const txtContent = await fs.readFile('scratch/window_types_catalog.txt', 'utf-8');
        const blocks = txtContent.split('----------------------------------------');
        const filteredTxtBlocks = [];

        for (const block of blocks) {
            const trimmedBlock = block.trim();
            if (!trimmedBlock) continue;
            
            const match = trimmedBlock.match(/Code:\s*(\S+)/);
            if (match) {
                const code = match[1];
                let isCompatible = false;
                for (const prefix of compatiblePrefixes) {
                    if (code.startsWith(prefix)) {
                        let isExcluded = false;
                        for (const incPrefix of incompatiblePrefixes) {
                            if (code.startsWith(incPrefix)) {
                                isExcluded = true;
                                break;
                            }
                        }
                        if (!isExcluded) {
                            isCompatible = true;
                            break;
                        }
                    }
                }

                if (isCompatible) {
                    filteredTxtBlocks.push(trimmedBlock);
                }
            }
        }

        const filteredTxtContent = filteredTxtBlocks.join('\n\n----------------------------------------\n\n') + '\n\n----------------------------------------\n';
        await fs.writeFile('scratch/window_types_catalog_iglo5.txt', filteredTxtContent, 'utf-8');

        console.log(`Filtered ${compatibleCount} compatible typologies out of ${lines.length - 2}.`);
        console.log("Saved: scratch/window_types_catalog_iglo5.csv");
        console.log("Saved: scratch/window_types_catalog_iglo5.txt");

    } catch (err) {
        console.error("Error filtering catalog:", err);
    }
}

run();
