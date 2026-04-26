import fs from 'fs';

const langs = ['ar', 'ca', 'de', 'en', 'es', 'eu', 'fi', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'uk'];

const translations = {
  en: {
    name: "IGLO EDGE",
    tagline: "Maximum insulation, minimal frame",
    description: "Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0.66 W/(m²K)* and a modern, angular profile shape. The extremely good thermal insulation parameters are due, among other things, to the 7-chamber profile design and 3 EPDM gaskets, including the central gasket.",
    standardEquipment: [
      "Double-chamber glazing package Ug = 0.5 W/(m²K)",
      "Swisspacer Ultimate plastic warm frame",
      "V-perfect weld",
      "4 anti-theft strikers according to the size of the sash and the hardware system",
      "Microventilation",
      "DUBLIN aluminium window handle",
      "Handle misplacement locking mechanism",
      "Perimeter, glazing and central gaskets in black or grey",
      "Filling of the lower hardware groove",
      "Sill trim",
      "Wide selection of PVC veneer colours",
      "3 profile colours to choose from: white, brown or anthracite"
    ]
  },
  es: {
    name: "IGLO EDGE",
    tagline: "Aislamiento máximo, marco mínimo",
    description: "Nuestra nueva ventana, la más avanzada tecnológicamente, se distingue por un excelente parámetro de aislamiento térmico de Uw = 0.66 W/(m²K)* y una forma de perfil moderna y angular. Los parámetros de aislamiento térmico extremadamente buenos se deben, entre otras cosas, al diseño del perfil de 7 cámaras y 3 juntas EPDM, incluida la junta central.",
    standardEquipment: [
      "Paquete de acristalamiento de doble cámara Ug = 0,5 W/(m²K)",
      "Marco cálido de plástico Swisspacer Ultimate",
      "Soldadura V-perfect",
      "4 cerraderos antirrobo según el tamaño de la hoja y el sistema de herrajes",
      "Microventilación",
      "Manilla de ventana de aluminio DUBLIN",
      "Mecanismo de bloqueo de manipulación de la manilla",
      "Juntas perimetrales, de acristalamiento y centrales en negro o gris",
      "Relleno de la ranura inferior del herraje",
      "Embellecedor de alféizar",
      "Amplia selección de colores de revestimiento de PVC",
      "3 colores de perfil a elegir: blanco, marrón o antracita"
    ]
  },
  de: {
    name: "IGLO EDGE",
    tagline: "Maximale Isolierung, minimaler Rahmen",
    description: "Unser neues, technologisch fortschrittlichstes Fenster zeichnet sich durch einen hervorragenden Wärmedämmwert von Uw = 0,66 W/(m²K)* und eine moderne, kantige Profilform aus. Die extrem guten Wärmedämmwerte sind unter anderem auf die 7-Kammer-Profilkonstruktion und 3 EPDM-Dichtungen, einschließlich der Mitteldichtung, zurückzuführen.",
    standardEquipment: [
      "Zweikammer-Verglasungspaket Ug = 0,5 W/(m²K)",
      "Warmer Kunststoff-Abstandhalter Swisspacer Ultimate",
      "V-Perfect-Schweißnaht",
      "4 Einbruchschutz-Schließbleche je nach Flügelgröße und Beschlagsystem",
      "Mikroventilation",
      "Aluminium-Fenstergriff DUBLIN",
      "Fehlbedienungssperre",
      "Umlaufende, Verglasungs- und Mitteldichtungen in Schwarz oder Grau",
      "Füllung der unteren Beschlagsnut",
      "Fensterbankanschluss",
      "Große Auswahl an PVC-Folienfarben",
      "3 Profilfarben zur Auswahl: Weiß, Braun oder Anthrazit"
    ]
  },
  fr: {
    name: "IGLO EDGE",
    tagline: "Isolation maximale, cadre minimal",
    description: "Notre nouvelle fenêtre, la plus avancée technologiquement, se distingue par un excellent paramètre d'isolation thermique de Uw = 0,66 W/(m²K)* et une forme de profilé moderne et angulaire. Les paramètres d'isolation thermique extrêmement bons sont dus, entre autres, à la conception du profilé à 7 chambres et aux 3 joints EPDM, y compris le joint central.",
    standardEquipment: [
      "Double vitrage Ug = 0,5 W/(m²K)",
      "Intercalaire chaud en plastique Swisspacer Ultimate",
      "Soudure V-perfect",
      "4 gâches anti-effraction selon la taille de l'ouvrant et le système de quincaillerie",
      "Micro-ventilation",
      "Poignée de fenêtre en aluminium DUBLIN",
      "Mécanisme de blocage de mauvaise manipulation de la poignée",
      "Joints périphériques, de vitrage et centraux en noir ou gris",
      "Remplissage de la rainure inférieure de la quincaillerie",
      "Profilé de finition",
      "Large choix de couleurs de plaxage PVC",
      "3 couleurs de profilés au choix : blanc, marron ou anthracite"
    ]
  },
  pl: {
    name: "IGLO EDGE",
    tagline: "Maksymalna izolacja, minimalna rama",
    description: "Nasze nowe, najbardziej zaawansowane technologicznie okno wyróżnia się doskonałym parametrem izolacyjności termicznej Uw = 0,66 W/(m²K)* oraz nowoczesnym, kanciastym kształtem profilu. Niezwykle dobre parametry izolacyjności termicznej to zasługa m.in. 7-komorowej budowy profilu oraz 3 uszczelek EPDM, w tym uszczelki centralnej.",
    standardEquipment: [
      "Dwukomorowy pakiet szybowy Ug = 0,5 W/(m²K)",
      "Ciepła ramka dystansowa z tworzywa Swisspacer Ultimate",
      "Zgrzew V-perfect",
      "4 zaczepy antywyważeniowe w zależności od rozmiaru skrzydła i systemu okuć",
      "Mikrowentylacja",
      "Aluminiowa klamka okienna DUBLIN",
      "Blokada błędnego położenia klamki",
      "Uszczelki obwodowe, przyszybowe i centralne w kolorze czarnym lub szarym",
      "Wypełnienie dolnego rowka okuciowego",
      "Listwa podparapetowa",
      "Szeroki wybór kolorów oklein PVC",
      "3 kolory profilu do wyboru: biały, brązowy lub antracytowy"
    ]
  },
  it: {
    name: "IGLO EDGE",
    tagline: "Massimo isolamento, telaio minimo",
    description: "La nostra nuova finestra, la più avanzata tecnologicamente, si distingue per un eccellente parametro di isolamento termico di Uw = 0,66 W/(m²K)* e una forma del profilo moderna e angolare. I parametri di isolamento termico estremamente buoni sono dovuti, tra le altre cose, al design del profilo a 7 camere e alle 3 guarnizioni in EPDM, inclusa la guarnizione centrale.",
    standardEquipment: [
      "Pacchetto vetrocamera a due camere Ug = 0,5 W/(m²K)",
      "Canalina calda in plastica Swisspacer Ultimate",
      "Saldatura V-perfect",
      "4 riscontri antieffrazione in base alle dimensioni dell'anta e al sistema di ferramenta",
      "Microventilazione",
      "Maniglia per finestra in alluminio DUBLIN",
      "Meccanismo di blocco dell'errata manovra della maniglia",
      "Guarnizioni perimetrali, del vetro e centrali in nero o grigio",
      "Riempimento della cava inferiore della ferramenta",
      "Profilo di finitura davanzale",
      "Ampia selezione di colori per pellicole in PVC",
      "3 colori del profilo tra cui scegliere: bianco, marrone o antracite"
    ]
  }
};

for (const lang of langs) {
  const filePath = `src/locales/${lang}.json`;
  if (fs.existsSync(filePath)) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Choose translation or fallback to English if not provided in our dictionary
    const t = translations[lang] || translations['en'];
    
    // Create productData object if it doesn't exist
    if (!data.productData) data.productData = {};
    if (!data.productData.igloEdge) data.productData.igloEdge = {};
    
    // Assign fields
    data.productData.igloEdge.name = t.name;
    data.productData.igloEdge.tagline = t.tagline;
    data.productData.igloEdge.description = t.description;
    data.productData.igloEdge.standardEquipment = t.standardEquipment;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
}
