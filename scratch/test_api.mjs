import http from 'http';

const data = JSON.stringify({
  input: {
    article: "F100",
    profilsatz: "IG5",
    materialart: 2,
    beschvar: "UR-P",
    width_mm: 1000,
    height_mm: 1000,
    sashCount: 1,
    openings: ["UR"],
    color: { type: "W-W", code: "0000", exteriorRal: "0000" },
    frameProfile: "50001",
    sashProfile: "50011",
    infills: [{ code: "2-24", panes: ["FL4", "T4"], spacer: "S" }],
    options: { beadStyle: "Z", weldType: "standard", frameReinforcement: "standard" },
    hardware: {},
    schwelle: 0,
    dealer: { kundenNr: 1008, pricelistKurzbez: "EUR23011", land: "CH" }
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 5173,
  path: '/api/price',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
