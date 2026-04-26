const fs = require('fs');

const enFile = 'src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

en.productData['iglo-energy-classic'] = {
  name: "IGLO Energy Classic",
  tagline: "A unique design with exceptional thermal insulation",
  description: "A unique design where you can choose the square-shaped glazing bead to reflect the latest architectural trends. The remarkable thermal insulation parameters are ensured by the optimum 7-chamber profile structure, a specially designed sealing system made of foamed EPDM and glass packages with high thermal insulation parameters.",
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "V-perfect weld",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours"
  ]
};

fs.writeFileSync(enFile, JSON.stringify(en, null, 2));

const esFile = 'src/locales/es.json';
const es = JSON.parse(fs.readFileSync(esFile, 'utf8'));

es.productData['iglo-energy-classic'] = {
  name: "IGLO Energy Classic",
  tagline: "Un diseño único con aislamiento térmico excepcional",
  description: "Un diseño único en el que puede elegir el junquillo cuadrado para reflejar las últimas tendencias arquitectónicas. Los notables parámetros de aislamiento térmico están garantizados por la óptima estructura del perfil de 7 cámaras, un sistema de sellado especialmente diseñado de EPDM espumado y paquetes de vidrio con altos parámetros de aislamiento térmico.",
  standardEquipment: [
    "Paquete de acristalamiento de doble cámara Ug = 0,5 W/(m²K)",
    "Marco cálido de plástico Swisspacer Ultimate - como opción gratuita",
    "Soldadura V-perfect",
    "4 cerraderos antirrobo según el tamaño de la hoja y el sistema de herraje",
    "Microventilación",
    "Manilla de ventana de aluminio",
    "Mecanismo de bloqueo por error de manejo de manilla",
    "Juntas perimetrales, de acristalamiento y centrales en negro o gris",
    "Relleno de la ranura inferior del herraje",
    "Embellecedor de alféizar",
    "Amplia selección de colores de revestimiento de PVC"
  ]
};

fs.writeFileSync(esFile, JSON.stringify(es, null, 2));
console.log("Updated locales for Iglo Energy Classic.");
