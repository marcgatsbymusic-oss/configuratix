import fs from 'fs';

const langs = ['ar', 'ca', 'de', 'en', 'es', 'eu', 'fi', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'uk'];

const additionalOpts = {
  en: {
    mounting: { title: "Mounting accessories", description: "Here you will find the products necessary for proper installation of joinery." },
    muntin: { title: "Muntin bars", description: "An attractive addition that highlights the unique character of the building." },
    fittings: { title: "Reliable fittings", description: "Safety, comfort and functionality in every detail." },
    glass: { title: "Sandblasted glass", description: "A perfect combination of modern design and privacy." },
    spacers: { title: "Spacers", description: "The latest generation of spacers ensuring thermal comfort." },
    ventilation: { title: "Ventilation", description: "Ensure healthy air and optimal humidity in your home." },
    sill: { title: "Window sill PVC", description: "Over 30 veneer colours to choose from." },
    shutters: { title: "Roller Shutters", description: "Protect your home with integrated external roller shutters." },
    'mosquito-nets': { title: "Mosquito Nets", description: "Keep insects out while letting fresh air in." }
  },
  es: {
    mounting: { title: "Accesorios de montaje", description: "Aquí encontrará los productos necesarios para la correcta instalación de la carpintería." },
    muntin: { title: "Barrotillos", description: "Un complemento atractivo que resalta el carácter único del edificio." },
    fittings: { title: "Herrajes fiables", description: "Seguridad, comodidad y funcionalidad en cada detalle." },
    glass: { title: "Cristal pulido con chorro de arena", description: "Una combinación perfecta de diseño moderno y privacidad." },
    spacers: { title: "Intercalarios", description: "La última generación de intercalarios que garantizan el confort térmico." },
    ventilation: { title: "Ventilación", description: "Garantice un aire saludable y una humedad óptima en su hogar." },
    sill: { title: "Alféizar de PVC", description: "Más de 30 colores de revestimiento para elegir." },
    shutters: { title: "Persianas enrollables", description: "Proteja su hogar con persianas exteriores integradas." },
    'mosquito-nets': { title: "Mosquiteras", description: "Mantenga a los insectos fuera mientras deja entrar aire fresco." }
  },
  de: {
    mounting: { title: "Montagezubehör", description: "Hier finden Sie die Produkte, die für eine ordnungsgemäße Installation der Tischlerei erforderlich sind." },
    muntin: { title: "Sprossen", description: "Eine attraktive Ergänzung, die den einzigartigen Charakter des Gebäudes unterstreicht." },
    fittings: { title: "Zuverlässige Beschläge", description: "Sicherheit, Komfort und Funktionalität in jedem Detail." },
    glass: { title: "Sandgestrahltes Glas", description: "Eine perfekte Kombination aus modernem Design und Privatsphäre." },
    spacers: { title: "Abstandhalter", description: "Die neueste Generation von Abstandhaltern für thermischen Komfort." },
    ventilation: { title: "Lüftung", description: "Sorgen Sie für gesunde Luft und optimale Luftfeuchtigkeit in Ihrem Zuhause." },
    sill: { title: "Fensterbank PVC", description: "Über 30 Folienfarben zur Auswahl." },
    shutters: { title: "Rollläden", description: "Schützen Sie Ihr Zuhause mit integrierten Außenrollläden." },
    'mosquito-nets': { title: "Fliegengitter", description: "Halten Sie Insekten draußen, während Sie frische Luft hereinlassen." }
  },
  fr: {
    mounting: { title: "Accessoires de montage", description: "Vous trouverez ici les produits nécessaires à l'installation correcte de la menuiserie." },
    muntin: { title: "Petits bois", description: "Un ajout attrayant qui met en valeur le caractère unique du bâtiment." },
    fittings: { title: "Quincaillerie fiable", description: "Sécurité, confort et fonctionnalité dans les moindres détails." },
    glass: { title: "Verre sablé", description: "Une combinaison parfaite de design moderne et d'intimité." },
    spacers: { title: "Intercalaires", description: "La dernière génération d'intercalaires garantissant le confort thermique." },
    ventilation: { title: "Ventilation", description: "Assurez un air sain et une humidité optimale dans votre maison." },
    sill: { title: "Appui de fenêtre en PVC", description: "Plus de 30 couleurs de plaxage au choix." },
    shutters: { title: "Volets roulants", description: "Protégez votre maison avec des volets roulants extérieurs intégrés." },
    'mosquito-nets': { title: "Moustiquaires", description: "Gardez les insectes à l'extérieur tout en laissant entrer l'air frais." }
  },
  pl: {
    mounting: { title: "Akcesoria montażowe", description: "Tutaj znajdziesz produkty niezbędne do prawidłowego montażu stolarki." },
    muntin: { title: "Szprosy", description: "Atrakcyjny dodatek, który podkreśla wyjątkowy charakter budynku." },
    fittings: { title: "Niezawodne okucia", description: "Bezpieczeństwo, komfort i funkcjonalność w każdym detalu." },
    glass: { title: "Szkło piaskowane", description: "Doskonałe połączenie nowoczesnego designu i prywatności." },
    spacers: { title: "Ramki dystansowe", description: "Najnowsza generacja ramek zapewniająca komfort cieplny." },
    ventilation: { title: "Wentylacja", description: "Zapewnij zdrowe powietrze i optymalną wilgotność w swoim domu." },
    sill: { title: "Parapet PVC", description: "Ponad 30 kolorów oklein do wyboru." },
    shutters: { title: "Rolety", description: "Chroń swój dom dzięki zintegrowanym roletom zewnętrznym." },
    'mosquito-nets': { title: "Moskitiery", description: "Zatrzymaj owady na zewnątrz, wpuszczając świeże powietrze." }
  },
  it: {
    mounting: { title: "Accessori di montaggio", description: "Qui troverai i prodotti necessari per la corretta installazione dei serramenti." },
    muntin: { title: "Inglesine", description: "Un'aggiunta attraente che mette in risalto il carattere unico dell'edificio." },
    fittings: { title: "Ferramenta affidabile", description: "Sicurezza, comfort e funzionalità in ogni dettaglio." },
    glass: { title: "Vetro sabbiato", description: "Una combinazione perfetta di design moderno e privacy." },
    spacers: { title: "Canaline", description: "L'ultima generazione di canaline che garantisce comfort termico." },
    ventilation: { title: "Ventilazione", description: "Assicura aria sana e umidità ottimale nella tua casa." },
    sill: { title: "Davanzale in PVC", description: "Oltre 30 colori di pellicole tra cui scegliere." },
    shutters: { title: "Tapparelle", description: "Proteggi la tua casa con avvolgibili esterni integrati." },
    'mosquito-nets': { title: "Zanzariere", description: "Tieni fuori gli insetti lasciando entrare aria fresca." }
  }
};

for (const lang of langs) {
  const filePath = `src/locales/${lang}.json`;
  if (fs.existsSync(filePath)) {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const t = additionalOpts[lang] || additionalOpts['en'];
    
    if (!data.productDetail) data.productDetail = {};
    if (!data.productDetail.additionalOptions) data.productDetail.additionalOptions = {};
    
    // Assign all categories
    for (const key of Object.keys(t)) {
      if (!data.productDetail.additionalOptions[key]) data.productDetail.additionalOptions[key] = {};
      data.productDetail.additionalOptions[key].title = t[key].title;
      data.productDetail.additionalOptions[key].description = t[key].description;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${lang}.json`);
  }
}
