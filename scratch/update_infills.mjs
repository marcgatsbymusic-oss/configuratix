import fs from 'fs';

const log = fs.readFileSync('scratch/infills.log', 'utf8'); // Wait, the previous scrape ran in background, did I save stdout? No, I didn't pipe it to a file. 

// I will re-run the scraper without downloading just to get the JSON.
