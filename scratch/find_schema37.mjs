import fs from 'fs';

const data = JSON.parse(fs.readFileSync('database_tables_dump.json', 'utf8'));

const formulas = data.formulas || [];

if (!formulas) {
    console.log("Could not find formulas table");
    process.exit(1);
}

const targetFormulas = formulas.filter(f => f.KEY1 === 'SCHEMA' && f.KEY2 === '37' && f.PREISNR === 0);

console.log("Found formulas:", targetFormulas.length);
targetFormulas.forEach(f => {
    console.log(JSON.stringify(f, null, 2));
});
