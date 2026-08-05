import fs from 'fs';

function parseTrace() {
    const data = fs.readFileSync('C:\\Temp\\AllTrace.txt', 'utf-8');
    const events = data.split('</event>');
    let out = "";
    
    for (const e of events) {
        let text = "";
        
        const valueRegex = /<value>(.*?)<\/value>/gs;
        let match;
        while ((match = valueRegex.exec(e)) !== null) {
            let val = match[1];
            if (val.startsWith('<![CDATA[')) {
                val = val.substring(9, val.length - 3);
            }
            val = val.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            
            const upper = val.toUpperCase().trim();
            if (upper.includes('INSERT ') || upper.includes('UPDATE ') || upper.includes('SP_PREPEXEC')) {
                if (!upper.startsWith('SELECT ') && !upper.startsWith('WAITFOR ') && val.length > 15) {
                    text += val + "\n";
                }
            }
        }
        
        if (text) {
            out += "====================\n" + text.trim() + "\n";
        }
    }
    
    fs.writeFileSync('C:\\Temp\\CleanTrace.sql', out);
    console.log("Wrote to C:\\Temp\\CleanTrace.sql");
}
parseTrace();
