const fs = require('fs');

let txt = fs.readFileSync('src/locales/es.json', 'utf8');
txt = txt.replace(
  '"10": "Amplia selección de colores de chapa de PVC.",\n      "11":    },',
  '"10": "Amplia selección de colores de chapa de PVC."\n    },'
);
txt = txt.replace(
  '"10": "Amplia selección de colores de chapa de PVC.",\r\n      "11":    },',
  '"10": "Amplia selección de colores de chapa de PVC."\r\n    },'
);

try {
  JSON.parse(txt);
  fs.writeFileSync('src/locales/es.json', txt);
  console.log('Fixed es.json');
} catch (e) {
  console.error('Still broken:', e.message);
  // Get surrounding text
  const match = e.message.match(/at position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log(txt.substring(Math.max(0, pos-100), Math.min(txt.length, pos+100)));
  }
}
