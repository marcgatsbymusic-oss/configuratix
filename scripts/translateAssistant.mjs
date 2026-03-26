import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('./src/locales');
const languages = ['en', 'de', 'es', 'fr', 'pt', 'ca', 'eu', 'nl', 'zh'];

// Fallbacks for languages
const langs = {
  en: {
    geoTitle: "Geographical Climate Analysis",
    geoDesc: "Windows are structurally designed with different climates in mind. Dependent upon exactly where you live, the system will calculate the precise CTE thermal rating to ensure maximum winter insulation and summer cooling.",
    province: "Province",
    city: "Municipality / City",
    selectProv: "Select Province...",
    selectCity: "Select City...",
    topoEngine: "Topographical Engine",
    altitude: "Altitude",
    cteZone: "CTE DB-HE CLIMATE ZONE",
    next: "Next Step",
    matTitle: "Material & Budget Constraints",
    matPref: "Material Preference",
    guideMe: "I don't know, guide me",
    budget: "Budget Scope",
    low: "Low", med: "Medium", premium: "Premium",
    timeTitle: "Project Timeline",
    t1: "As soon as possible", t1Sub: "15 Working days earliest",
    t2: "Next 1-2 months", t3: "More than 2 months", t4: "Still not sure",
    archTitle: "Acoustics & Architecture",
    houseType: "Housing Type", villa: "Villa", apt: "Apartment",
    noisePol: "Local Noise Pollution", nHigh: "City / High Traffic", nLow: "Rural / Quiet",
    processCalc: "Process Analysis",
    analyzing: "Analyzing Data",
    computing: "Computing optimal structural loads...",
    perfWin: "Your Perfect Window",
    basedOn: "Based on your absolute geographic Zone {{zone}} climate data, {{noise}} local noise pollution, and defined budget, our algorithms recommend:",
    recProf: "Recommended Profile System",
    base: "Base",
    glaze: "Glazing",
    useData: "Use this data and configure window",
    inter1: "Recommended: Intelligent Guided Assistant",
    inter2: "Take me directly to the configurator",
    inter2Sub: "(Complex Setup)"
  },
  es: {
    geoTitle: "Análisis Climático Geográfico",
    geoDesc: "Las ventanas están diseñadas estructuralmente pensando en diferentes climas. Dependiendo de dónde viva exactamente, el sistema calculará la calificación térmica precisa del CTE para garantizar el máximo aislamiento en invierno y refrigeración en verano.",
    province: "Provincia",
    city: "Municipio / Ciudad",
    selectProv: "Seleccionar Provincia...",
    selectCity: "Seleccionar Ciudad...",
    topoEngine: "Motor Topográfico",
    altitude: "Altitud",
    cteZone: "ZONA CLIMÁTICA CTE DB-HE",
    next: "Siguiente Paso",
    matTitle: "Restricciones de Material y Presupuesto",
    matPref: "Preferencia de Material",
    guideMe: "No lo sé, guíenme",
    budget: "Alcance del Presupuesto",
    low: "Bajo", med: "Medio", premium: "Premium",
    timeTitle: "Cronograma del Proyecto",
    t1: "Lo antes posible", t1Sub: "15 días laborables mínimo",
    t2: "Próximos 1-2 meses", t3: "Más de 2 meses", t4: "Aún no estoy seguro",
    archTitle: "Acústica y Arquitectura",
    houseType: "Tipo de Vivienda", villa: "Chalet", apt: "Apartamento",
    noisePol: "Contaminación Acústica Local", nHigh: "Ciudad / Tráfico Alto", nLow: "Rural / Tranquilo",
    processCalc: "Procesar Análisis",
    analyzing: "Analizando Datos",
    computing: "Calculando cargas estructurales óptimas...",
    perfWin: "Su Ventana Perfecta",
    basedOn: "Basado en los datos absolutos de su Zona geográfica {{zone}}, la contaminación acústica {{noise}} y el presupuesto definido, nuestros algoritmos recomiendan:",
    recProf: "Sistema de Perfil Recomendado",
    base: "Base",
    glaze: "Acristalamiento",
    useData: "Usar estos datos y configurar ventana",
    inter1: "Recomendado: Asistente Guiado Inteligente",
    inter2: "Llevarme directamente al configurador",
    inter2Sub: "(Configuración Compleja)"
  },
  de: {
    geoTitle: "Geografische Klimaanalyse",
    geoDesc: "Fenster sind strukturell für verschiedene Klimazonen ausgelegt. Abhängig davon, wo Sie genau leben, berechnet das System die genaue CTE-Bewertung.",
    province: "Provinz", city: "Gemeinde / Stadt", selectProv: "Provinz wählen...", selectCity: "Stadt wählen...",
    topoEngine: "Topografische Engine", altitude: "Höhe", cteZone: "CTE DB-HE KLIMAZONE", next: "Nächster Schritt",
    matTitle: "Material- & Budgetbeschränkungen", matPref: "Materialpräferenz", guideMe: "Ich weiß es nicht, bitte beraten",
    budget: "Budgetumfang", low: "Gering", med: "Mittel", premium: "Premium",
    timeTitle: "Projektzeitplan", t1: "So schnell wie möglich", t1Sub: "Frühestens 15 Arbeitstage",
    t2: "Nächste 1-2 Monate", t3: "Mehr als 2 Monate", t4: "Noch unsicher",
    archTitle: "Akustik & Architektur", houseType: "Gehäusetyp", villa: "Villa", apt: "Wohnung",
    noisePol: "Lokale Lärmbelastung", nHigh: "Stadt / Viel Verkehr", nLow: "Ländlich / Ruhig",
    processCalc: "Analyse verarbeiten", analyzing: "Daten analysieren", computing: "Berechnung optimaler Strukturlasten...",
    perfWin: "Ihr perfektes Fenster", basedOn: "Basierend auf Ihrer geografischen Zone {{zone}}, {{noise}} Lärm und Budget empfehlen wir:",
    recProf: "Empfohlenes Profilsystem", base: "Basis", glaze: "Verglasung",
    useData: "Diese Daten verwenden", inter1: "Empfohlen: Intelligenter Verkaufsassi", inter2: "Direkt zum Konfigurator", inter2Sub: "(Komplex)"
  },
  fr: {
    geoTitle: "Analyse Climatique Géographique", geoDesc: "Les fenêtres sont conçues pour différents climats. Selon votre emplacement, le système calcule le coefficient thermique CTE exact.",
    province: "Province", city: "Municipalité / Ville", selectProv: "Sélectionnez...", selectCity: "Sélectionnez...",
    topoEngine: "Moteur Topographique", altitude: "Altitude", cteZone: "ZONE CLIMATIQUE CTE", next: "Étape Suivante",
    matTitle: "Matériaux & Budget", matPref: "Préférence de Matériau", guideMe: "Je ne sais pas, guidez-moi",
    budget: "Budget", low: "Bas", med: "Moyen", premium: "Premium",
    timeTitle: "Calendrier du Projet", t1: "Dès que possible", t1Sub: "15 jours min",
    t2: "1 à 2 mois", t3: "Plus de 2 mois", t4: "Pas sûr",
    archTitle: "Acoustique & Architecture", houseType: "Type de Logement", villa: "Villa", apt: "Appartement",
    noisePol: "Pollution Sonore", nHigh: "Ville / Trafic", nLow: "Rural / Calme",
    processCalc: "Lancer l'Analyse", analyzing: "Analyse des données", computing: "Calcul des charges structurelles...",
    perfWin: "Votre Fenêtre Parfaite", basedOn: "Basé sur votre zone climatique {{zone}}, bruit {{noise}} et budget, nous recommandons :",
    recProf: "Système de Profil Recommandé", base: "Base", glaze: "Vitrage",
    useData: "Utiliser ces données", inter1: "Recommandé: Assistant Intelligent", inter2: "Aller au configurateur", inter2Sub: "(Complexe)"
  }
};

// Map default fallbacks
langs.pt = { ...langs.es }; langs.pt.geoTitle = "Análise Climática Geográfica"; langs.pt.next = "Próximo Passo";
langs.ca = { ...langs.es }; langs.ca.geoTitle = "Anàlisi Climàtica Geogràfica"; langs.ca.next = "Següent Pas";
langs.eu = { ...langs.es }; langs.eu.geoTitle = "Azterketa Klimatikoa"; langs.eu.next = "Hurrengo Urratsa";
langs.nl = { ...langs.en };
langs.zh = { ...langs.en };

languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data.assistant) {
        data.assistant = langs[lang] || langs.en;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
        console.log(`Updated ${lang}.json with 'assistant' namespace.`);
    }
  }
});
