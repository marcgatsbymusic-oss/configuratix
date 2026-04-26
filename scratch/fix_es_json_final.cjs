const fs = require('fs');

let txt = fs.readFileSync('src/locales/es.json', 'utf8');

// Fix the "11":   } issue
txt = txt.replace(
  '"10": "Amplia selección de colores de chapa de PVC.",\n      "11":    },',
  '"10": "Amplia selección de colores de chapa de PVC."\n    },'
);
txt = txt.replace(
  '"10": "Amplia selección de colores de chapa de PVC.",\r\n      "11":    },',
  '"10": "Amplia selección de colores de chapa de PVC."\r\n    },'
);
txt = txt.replace(
  '"10": "Amplia selección de colores de revestimiento de PVC.",\n      "11":    },',
  '"10": "Amplia selección de colores de revestimiento de PVC."\n    },'
);
txt = txt.replace(
  '"10": "Amplia selección de colores de revestimiento de PVC.",\r\n      "11":    },',
  '"10": "Amplia selección de colores de revestimiento de PVC."\r\n    },'
);

// Fix trailing commas
txt = txt.replace(/,\s*\]/g, '\n    ]');
txt = txt.replace(/,\s*\}/g, '\n  }');

fs.writeFileSync('src/locales/es.json', txt);

try {
  JSON.parse(txt);
  console.log('es.json is fully fixed!');
} catch (e) {
  console.error('Still broken:', e.message);
}
