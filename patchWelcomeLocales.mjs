import fs from 'fs';
import path from 'path';

const locales = {
  en: {
    welcome: {
      title: "Welcome to our AI powered windows configurator",
      description: "Selecting windows is not an easy task, there are many options and everybody's needs differ, that's why our configurator will guide and help you make the best choice that suits your needs and budget."
    },
    start: "Start"
  },
  es: {
    welcome: {
      title: "Bienvenido a nuestro configurador de ventanas impulsado por IA",
      description: "Seleccionar ventanas no es una tarea fácil, hay muchas opciones y las necesidades de cada persona difieren. Por eso nuestro configurador le guiará y le ayudará a tomar la mejor decisión que se adapte a sus necesidades y presupuesto."
    },
    start: "Empezar"
  },
  fr: {
    welcome: {
      title: "Bienvenue dans notre configurateur de fenêtres optimisé par l'IA",
      description: "Choisir des fenêtres n'est pas une tâche facile, les options sont nombreuses et les besoins de chacun diffèrent. C'est pourquoi notre configurateur vous guidera et vous aidera à faire le meilleur choix adapté à vos besoins et à votre budget."
    },
    start: "Démarrer"
  },
  de: {
    welcome: {
      title: "Willkommen bei unserem KI-gestützten Fenster-Konfigurator",
      description: "Die Auswahl von Fenstern ist keine leichte Aufgabe, es gibt viele Optionen und die Bedürfnisse jedes Einzelnen sind unterschiedlich. Deshalb wird Sie unser Konfigurator begleiten und Ihnen helfen, die beste Entscheidung für Ihre Bedürfnisse und Ihr Budget zu treffen."
    },
    start: "Starten"
  },
  pt: {
    welcome: {
      title: "Bem-vindo ao nosso configurador de janelas Inteligente",
      description: "Escolher janelas não é uma tarefa fácil, existem muitas opções e as necessidades de cada pessoa divergem. É por isso que o nosso configurador o guiará e o ajudará a tomar a melhor decisão que se adapte às suas necessidades e orçamento."
    },
    start: "Iniciar"
  },
  nl: {
    welcome: {
      title: "Welkom bij onze AI-gestuurde ramenconfigurator",
      description: "Ramen kiezen is geen gemakkelijke taak, er zijn veel opties en de behoeften van iedereen verschillen. Daarom zal onze configurator u begeleiden en u helpen de beste keuze te maken die bij uw behoeften en budget past."
    },
    start: "Starten"
  },
  it: {
    welcome: {
      title: "Benvenuto nel nostro configuratore di finestre guidato dall' IA",
      description: "Scegliere le finestre non è un compito facile, ci sono molte opzioni e le esigenze di ognuno differiscono. Ecco perché il nostro configuratore ti guiderà e ti aiuterà a fare la scelta migliore adatta alle tue esigenze e al tuo budget."
    },
    start: "Inizia"
  },
  pl: {
    welcome: {
      title: "Witamy w naszym konfiguratorze okien zasilanym przez AI",
      description: "Wybór okien nie jest łatwym zadaniem, istnieje wiele opcji, a potrzeby każdego z nas są różne. Dlatego nasz konfigurator przeprowadzi Cię przez ten proces i pomoże Ci dokonać najlepszego wyboru dostosowanego do Twoich potrzeb i budżetu."
    },
    start: "Rozpocznij"
  },
  ca: {
    welcome: {
      title: "Benvingut al nostre configurador de finestres impulsat per IA",
      description: "Seleccionar finestres no és una tasca fàcil, hi ha moltes opcions i les necessitats de cadascú difereixen. És per això que el nostre configurador us guiarà i us ajudarà a prendre la millor decisió que s'adapti a les vostres necessitats i pressupost."
    },
    start: "Començar"
  }
};

const dir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';

for (const [lang, data] of Object.entries(locales)) {
  const p = path.join(dir, `${lang}.json`);
  if (fs.existsSync(p)) {
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (json.configurator) {
      json.configurator.welcome = data.welcome;
      if (!json.configurator.steps) json.configurator.steps = {};
      json.configurator.steps.start = data.start;
    }
    fs.writeFileSync(p, JSON.stringify(json, null, 2));
    console.log(`Updated $[lang].json`);
  }
}
console.log('All Translation Dictionaries Synced Successfully');
