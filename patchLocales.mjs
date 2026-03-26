import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const locales = ['en', 'de', 'fr', 'pt', 'es', 'nl', 'it', 'pl'];

const newKeys = {
  en: {
    help: {
      materialDesc: "Choose the type of material for your window. Below you will find a summary of the main characteristics of each one.",
      pvc: "PVC",
      aluminum: "ALUMINUM",
      durability: "Durability",
      maintenance: "Maintenance",
      insulation: "Insulation",
      weatherRes: "Weather resistance",
      security: "Security",
      ecoFootprint: "Ecological footprint",
      legend: "* = neutral | ** = good | *** = very good",
      windowTypeDesc: "Our windows have different opening options. There are one, two, and three-leaf windows with top or bottom transoms.",
      singleLeaf: "Single leaf windows",
      doubleLeaf: "Two-leaf windows",
      tripleLeaf: "Three-leaf windows",
      specialWindows: "Special window types",
      leaveConf: "Leave configurator?",
      stillQuestions: "Do you still have questions about your order or the configurator?",
      csTeam: "Our customer service team (and our AI Assistant) will be happy to advise you for free:",
      monFri: "(Monday to Friday from 8:00 to 18:00)",
      aiAssist: "AI Assistant",
      avail247: "(Available 24/7)",
      exitWarning: "By exiting the configurator, your previous selection will be lost.",
      continueConf: "Continue in configurator",
      exitConf: "Exit configurator",
      haveQuestions: "Do you have any questions?",
      availableToday: "We are available today until 18:00.",
      shallWeTalk: "Shall we talk? Book your call now.",
      scheduleMeeting: "Schedule meeting",
      up: "UP"
    }
  },
  es: {
    help: {
      materialDesc: "Elige el tipo de material para tu ventana. A continuación encontrarás un resumen de las principales características de cada uno de ellos.",
      pvc: "PVC",
      aluminum: "ALUMINIO",
      durability: "Durabilidad",
      maintenance: "Mantenimiento",
      insulation: "Aislamiento",
      weatherRes: "Resistencia a la intemperie",
      security: "Seguridad",
      ecoFootprint: "Huella ecológica",
      legend: "* = neutro | ** = bueno | *** = muy bueno",
      windowTypeDesc: "Nuestras ventanas tienen diferentes opciones de apertura. Hay ventanas de una, dos y tres hojas con travesaños superiores o inferiores.",
      singleLeaf: "Ventanas de una hoja",
      doubleLeaf: "Ventanas de dos hojas",
      tripleLeaf: "Ventanas de tres hojas",
      specialWindows: "Tipos de ventanas especiales",
      leaveConf: "¿Salir del configurador?",
      stillQuestions: "¿Tienes todavía preguntas sobre tu pedido o el configurador?",
      csTeam: "Nuestro equipo de atención al cliente (y nuestro Asistente de IA) estará encantado de asesorarte gratuitamente:",
      monFri: "(de lunes a viernes de 8:00 a 18:00)",
      aiAssist: "Asistente de IA",
      avail247: "(Disponible 24/7)",
      exitWarning: "Al salir del configurador, se perderá tu selección anterior.",
      continueConf: "Continuar en el configurador",
      exitConf: "Salir del configurador",
      haveQuestions: "¿Tienes alguna pregunta?",
      availableToday: "Estamos disponibles hoy hasta 18:00.",
      shallWeTalk: "¿Hablamos? Reserva tu llamada ahora.",
      scheduleMeeting: "Programar reunión",
      up: "ARRIBA"
    }
  },
  de: {
    help: {
      materialDesc: "Wählen Sie das Material für Ihr Fenster. Unten finden Sie eine Zusammenfassung der wichtigsten Eigenschaften.",
      pvc: "PVC",
      aluminum: "ALUMINIUM",
      durability: "Haltbarkeit",
      maintenance: "Wartung",
      insulation: "Isolierung",
      weatherRes: "Wetterbeständigkeit",
      security: "Sicherheit",
      ecoFootprint: "Ökologischer Fußabdruck",
      legend: "* = neutral | ** = gut | *** = sehr gut",
      windowTypeDesc: "Unsere Fenster haben verschiedene Öffnungsmöglichkeiten. Es gibt ein-, zwei- und dreiflügelige Fenster mit Ober- oder Unterlichtern.",
      singleLeaf: "Einflügelige Fenster",
      doubleLeaf: "Zweiflügelige Fenster",
      tripleLeaf: "Dreiflügelige Fenster",
      specialWindows: "Sonderfenster",
      leaveConf: "Konfigurator verlassen?",
      stillQuestions: "Haben Sie noch Fragen zu Ihrer Bestellung oder dem Konfigurator?",
      csTeam: "Unser Kundenservice-Team (und unser KI-Assistent) beraten Sie gerne kostenlos:",
      monFri: "(Montag bis Freitag von 8:00 bis 18:00 Uhr)",
      aiAssist: "KI-Assistent",
      avail247: "(24/7 verfügbar)",
      exitWarning: "Beim Verlassen des Konfigurators geht Ihre bisherige Auswahl verloren.",
      continueConf: "Im Konfigurator fortfahren",
      exitConf: "Konfigurator verlassen",
      haveQuestions: "Haben Sie Fragen?",
      availableToday: "Wir sind heute bis 18:00 Uhr erreichbar.",
      shallWeTalk: "Sollen wir sprechen? Buchen Sie jetzt Ihren Anruf.",
      scheduleMeeting: "Meeting planen",
      up: "NACH OBEN"
    }
  },
  fr: {
    help: {
      materialDesc: "Choisissez le type de matériau pour votre fenêtre. Vous trouverez ci-dessous un résumé des principales caractéristiques.",
      pvc: "PVC",
      aluminum: "ALUMINIUM",
      durability: "Durabilité",
      maintenance: "Entretien",
      insulation: "Isolation",
      weatherRes: "Résistance aux intempéries",
      security: "Sécurité",
      ecoFootprint: "Empreinte écologique",
      legend: "* = neutre | ** = bon | *** = très bon",
      windowTypeDesc: "Nos fenêtres ont différentes options d'ouverture. Il y a des fenêtres à un, deux et trois vantaux avec impostes.",
      singleLeaf: "Fenêtres à un vantail",
      doubleLeaf: "Fenêtres à deux vantaux",
      tripleLeaf: "Fenêtres à trois vantaux",
      specialWindows: "Types de fenêtres spéciaux",
      leaveConf: "Quitter le configurateur ?",
      stillQuestions: "Avez-vous encore des questions concernant votre commande ou le configurateur ?",
      csTeam: "Notre équipe du service client (et notre Assistant IA) se feront un plaisir de vous conseiller gratuitement :",
      monFri: "(Du lundi au vendredi de 8h00 à 18h00)",
      aiAssist: "Assistant IA",
      avail247: "(Disponible 24/7)",
      exitWarning: "En quittant le configurateur, votre sélection précédente sera perdue.",
      continueConf: "Continuer dans le configurateur",
      exitConf: "Quitter le configurateur",
      haveQuestions: "Avez-vous des questions ?",
      availableToday: "Nous sommes disponibles aujourd'hui jusqu'à 18h00.",
      shallWeTalk: "Parlons-nous ? Réservez votre appel maintenant.",
      scheduleMeeting: "Planifier une réunion",
      up: "HAUT"
    }
  }
};

locales.forEach(lang => {
  const translations = newKeys[lang] || newKeys['en'];
  const filepath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    data.help = translations.help;
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
});
console.log('Translations patched!');
