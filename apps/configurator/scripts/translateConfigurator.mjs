import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('./src/locales');
const languages = ['en', 'de', 'es', 'fr', 'pt', 'ca', 'eu'];

const dictionaries = {
  en: {
    title: "Design your custom window system.",
    subtitle: "Pick the material and configure your exact architectural specifications below.",
    steps: {
      material: "Material Profile",
      system: "System Profile",
      windowType: "Window Type",
      openingType: "Opening Type",
      color: "Color & Decor",
      dimensions: "Dimensions (MM)",
      glazing: "Glazing Package",
      options: "Accessories & Add-ons"
    },
    summary: {
      title: "Specs Overview",
      dimensions: "Dimensions",
      material: "Material Profile",
      system: "System Profile",
      windowType: "Window Type",
      color: "Color & Decor",
      glazing: "Glazing",
      financials: "Financials",
      baseFramework: "Base Framework",
      hardwareAssembly: "Hardware Assembly",
      accessories: "Accessories",
      totalSystem: "Total System",
      exportJson: "JSON Export",
      saveToCart: "Save to Cart",
      edit: "Edit"
    },
    inputs: {
      w: "W",
      h: "H",
      mm: "mm",
      cm: "(CM)"
    },
    state: {
      selected: "Selected",
      selectWindowType: "Select Window Type",
      openingDirection: "Opening Direction",
      fixedNoOpening: "Fixed (No Opening)",
      turnTilt: "Innerleaf (Turn/Tilt)",
      sashes: "{{count}} Sashes configuration"
    },
    blueprint: {
      interiorView: "Interior View"
    }
  },
  de: {
    title: "Gestalten Sie Ihr individuelles Fenstersystem.",
    subtitle: "Wählen Sie das Material und konfigurieren Sie unten Ihre genauen architektonischen Spezifikationen.",
    steps: {
      material: "Materialprofil",
      system: "Systemprofil",
      windowType: "Fenstertyp",
      openingType: "Öffnungsart",
      color: "Farbe & Dekor",
      dimensions: "Maße (MM)",
      glazing: "Verglasung",
      options: "Zubehör & Extras"
    },
    summary: {
      title: "Spezifikationsübersicht",
      dimensions: "Maße",
      material: "Material",
      system: "System",
      windowType: "Fenstertyp",
      color: "Farbe & Dekor",
      glazing: "Verglasung",
      financials: "Finanzen",
      baseFramework: "Grundrahmen",
      hardwareAssembly: "Beschläge",
      accessories: "Zubehör",
      totalSystem: "Geasmtsystem",
      exportJson: "JSON Export",
      saveToCart: "In den Warenkorb",
      edit: "Bearbeiten"
    },
    inputs: {
      w: "B",
      h: "H",
      mm: "mm",
      cm: "(CM)"
    },
    state: {
      selected: "Ausgewählt",
      selectWindowType: "Fenstertyp auswählen",
      openingDirection: "Öffnungsrichtung",
      fixedNoOpening: "Fest (Keine Öffnung)",
      turnTilt: "Flügel (Dreh/Kipp)",
      sashes: "{{count}} Flügelkonfiguration"
    },
    blueprint: {
      interiorView: "Innenansicht"
    }
  },
  es: {
    title: "Diseña tu sistema de ventanas personalizado.",
    subtitle: "Elige el material y configura tus especificaciones arquitectónicas exactas a continuación.",
    steps: {
      material: "Perfil del material",
      system: "Perfil del sistema",
      windowType: "Tipo de ventana",
      openingType: "Tipo de apertura",
      color: "Color y Decoración",
      dimensions: "Dimensiones (MM)",
      glazing: "Acristalamiento",
      options: "Accesorios"
    },
    summary: {
      title: "Resumen de especificaciones",
      dimensions: "Dimensiones",
      material: "Material",
      system: "Sistema",
      windowType: "Tipo de ventana",
      color: "Color y Decoración",
      glazing: "Acristalamiento",
      financials: "Finanzas",
      baseFramework: "Marco base",
      hardwareAssembly: "Herrajes",
      accessories: "Accesorios",
      totalSystem: "Sistema Total",
      exportJson: "Exportar JSON",
      saveToCart: "Guardar en carrito",
      edit: "Editar"
    },
    inputs: {
      w: "A",
      h: "H",
      mm: "mm",
      cm: "(CM)"
    },
    state: {
      selected: "Seleccionado",
      selectWindowType: "Seleccionar Tipo de Ventana",
      openingDirection: "Dirección de apertura",
      fixedNoOpening: "Fijo (Sin apertura)",
      turnTilt: "Hoja (Oscilobatiente)",
      sashes: "Configuración de {{count}} hojas"
    },
    blueprint: {
      interiorView: "Vista Interior"
    }
  },
  fr: {
    title: "Concevez votre système de fenêtres personnalisé.",
    subtitle: "Choisissez le matériau et configurez vos spécifications architecturales exactes ci-dessous.",
    steps: {
      material: "Profilé de matériau",
      system: "Profilé de système",
      windowType: "Type de fenêtre",
      openingType: "Type d'ouverture",
      color: "Couleur & Décor",
      dimensions: "Dimensions (MM)",
      glazing: "Vitrage",
      options: "Accessoires"
    },
    summary: {
      title: "Aperçu des spécifications",
      dimensions: "Dimensions",
      material: "Matériau",
      system: "Système",
      windowType: "Type de fenêtre",
      color: "Couleur & Décor",
      glazing: "Vitrage",
      financials: "Finances",
      baseFramework: "Cadre de base",
      hardwareAssembly: "Quincaillerie",
      accessories: "Accessoires",
      totalSystem: "Système Total",
      exportJson: "Export JSON",
      saveToCart: "Ajouter au panier",
      edit: "Modifier"
    },
    inputs: {
      w: "L",
      h: "H",
      mm: "mm",
      cm: "(CM)"
    },
    state: {
      selected: "Sélectionné",
      selectWindowType: "Sélectionnez le type de fenêtre",
      openingDirection: "Direction d'ouverture",
      fixedNoOpening: "Fixe (Sans ouverture)",
      turnTilt: "Vantail (Oscillo-battant)",
      sashes: "Configuration à {{count}} vantaux"
    },
    blueprint: {
      interiorView: "Vue Intérieure"
    }
  },
  pt: {
    title: "Desenhe o seu sistema de janelas personalizado.",
    subtitle: "Escolha o material e configure as suas especificações arquitetónicas exatas abaixo.",
    steps: {
      material: "Perfil do Material",
      system: "Perfil do Sistema",
      windowType: "Tipo de Janela",
      openingType: "Tipo de Abertura",
      color: "Cor e Decoração",
      dimensions: "Dimensões (MM)",
      glazing: "Vidros",
      options: "Acessórios"
    },
    summary: {
      title: "Resumo das Especificações",
      dimensions: "Dimensões",
      material: "Material",
      system: "Sistema",
      windowType: "Tipo de Janela",
      color: "Cor e Decoração",
      glazing: "Vidros",
      financials: "Finanças",
      baseFramework: "Armação Básica",
      hardwareAssembly: "Ferragens",
      accessories: "Acessórios",
      totalSystem: "Sistema Total",
      exportJson: "JSON",
      saveToCart: "Guardar no Carrinho",
      edit: "Editar"
    },
    inputs: {
      w: "L",
      h: "A",
      mm: "mm",
      cm: "(CM)"
    },
    state: {
      selected: "Selecionado",
      selectWindowType: "Selecionar Tipo de Janela",
      openingDirection: "Direção de Abertura",
      fixedNoOpening: "Fixo (Sem Abertura)",
      turnTilt: "Folha (Oscilobatente)",
      sashes: "Configuração de {{count}} folhas"
    },
    blueprint: {
      interiorView: "Vista Interior"
    }
  },
  ca: {
    title: "Dissenya el teu sistema de finestres personalitzat.",
    subtitle: "Tria el material i configura les teves especificacions arquitectòniques exactes a continuació.",
    steps: {
      material: "Perfil del Material",
      system: "Perfil del Sistema",
      windowType: "Tipus de Finestra",
      openingType: "Tipus d'Obertura",
      color: "Color i Decoració",
      dimensions: "Dimensions (MM)",
      glazing: "Vidres",
      options: "Accessoris"
    },
    summary: {
      title: "Resum d'Especificacions",
      dimensions: "Dimensions",
      material: "Material",
      system: "Sistema",
      windowType: "Tipus de Finestra",
      color: "Color i Decoració",
      glazing: "Vidres",
      financials: "Finances",
      baseFramework: "Marc base",
      hardwareAssembly: "Ferratges",
      accessories: "Accessoris",
      totalSystem: "Sistema Total",
      exportJson: "JSON",
      saveToCart: "Guardar al Carretó",
      edit: "Editar"
    },
    inputs: {
      w: "A",
      h: "A",
      mm: "mm",
      cm: "(CM)"
    },
    state: {
      selected: "Seleccionat",
      selectWindowType: "Seleccionar Tipus de Finestra",
      openingDirection: "Direcció d'obertura",
      fixedNoOpening: "Fix (Sense obertura)",
      turnTilt: "Fulla (Oscil·lobatent)",
      sashes: "Configuració de {{count}} fulles"
    },
    blueprint: {
      interiorView: "Vista Interior"
    }
  }
};

// Fallback eu to es for safety if missing
dictionaries.eu = { ...dictionaries.es, title: "Diseinatu zure neurriko leiho sistema." };

languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.configurator = dictionaries[lang] || dictionaries.en;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${lang}.json with configurator namespace.`);
  }
});
