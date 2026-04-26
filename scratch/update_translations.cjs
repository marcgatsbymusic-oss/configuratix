const fs = require('fs');

const enFile = 'src/locales/en.json';
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

en.productData['iglo-energy'] = {
  name: "IGLO Energy",
  tagline: "An innovative and original 7-chamber A-class profile",
  description: "An innovative and original 7-chamber A-class profile made exclusively of primary materials. The world's first system using a central gasket made of foamed EPDM to ensure the best energy efficiency parameters. Iglo Energy windows also stand out for their perfect parameters in terms of water tightness, microventilation and resistance to wind.",
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours",
    "Profile available in two colours: white, brown"
  ]
};

fs.writeFileSync(enFile, JSON.stringify(en, null, 2));

const esFile = 'src/locales/es.json';
const es = JSON.parse(fs.readFileSync(esFile, 'utf8'));

es.productData['iglo-energy'] = {
  name: "IGLO Energy",
  tagline: "Un perfil innovador y original de clase A de 7 cámaras",
  description: "Un perfil innovador y original de clase A de 7 cámaras fabricado exclusivamente con materiales primarios. El primer sistema del mundo que utiliza una junta central de EPDM espumado para garantizar los mejores parámetros de eficiencia energética. Las ventanas Iglo Energy también destacan por sus perfectos parámetros de estanqueidad al agua, microventilación y resistencia al viento.",
  standardEquipment: [
    "Paquete de acristalamiento de doble cámara Ug = 0,5 W/(m²K)",
    "Marco cálido de plástico Swisspacer Ultimate - como opción gratuita",
    "4 cerraderos antirrobo según el tamaño de la hoja y el sistema de herraje",
    "Microventilación",
    "Manilla de ventana de aluminio",
    "Mecanismo de bloqueo por error de manejo de manilla",
    "Juntas perimetrales, de acristalamiento y centrales en negro o gris",
    "Relleno de la ranura inferior del herraje",
    "Embellecedor de alféizar",
    "Amplia selección de colores de revestimiento de PVC",
    "Perfil disponible en dos colores: blanco, marrón"
  ]
};

fs.writeFileSync(esFile, JSON.stringify(es, null, 2));
console.log("Updated locales.");
