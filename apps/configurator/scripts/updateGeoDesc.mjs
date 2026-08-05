import fs from 'fs';
import path from 'path';

const translations = {
  es: "Clima a tu Medida\nNuestras ventanas están diseñadas específicamente para el clima de tu zona. Basándonos en tu ubicación exacta, calculamos el rendimiento térmico ideal para garantizar el máximo aislamiento en invierno y frescura en verano.\n\nTus beneficios:\n\nAhorro energético: Reduce el gasto en calefacción y aire acondicionado.\n\nConfort total: Despídete de las corrientes de aire y del calor sofocante.\n\nPrecisión local: Tecnología adaptada específicamente a tu ciudad.",
  en: "Climate Tailored to You\nOur windows are designed specifically for the climate in your area. Based on your exact location, we calculate the ideal thermal performance to guarantee maximum insulation in winter and freshness in summer.\n\nYour benefits:\n\nEnergy savings: Reduce heating and air conditioning expenses.\n\nTotal comfort: Say goodbye to drafts and stifling heat.\n\nLocal precision: Technology specifically adapted to your city.",
  ca: "Clima a la teva mesura\nLes nostres finestres estan dissenyades específicament per al clima de la teva zona. Basant-nos en la teva ubicació exacta, calculem el rendiment tèrmic ideal per garantir el màxim aïllament a l'hivern i frescor a l'estiu.\n\nEls teus beneficis:\n\nEstalvi energètic: Redueix la despesa en calefacció i aire condicionat.\n\nConfort total: Acomiada't dels corrents d'aire i de la calor sufocant.\n\nPrecisió local: Tecnologia adaptada específicament a la teva ciutat.",
  eu: "Zure neurrira egindako Klima\nGure leihoak zure inguruko klimarako berariaz diseinatuta daude. Zure kokapen zehatzean oinarrituta, neguan gehienezko isolamendua eta udan freskotasuna bermatzeko errendimendu termiko ezin hobea kalkulatzen dugu.\n\nZure abantailak:\n\nEnergia-aurrezkia: Murriztu berokuntza eta aire girotuaren gastua.\n\nErabateko erosotasuna: Agur esan aire-korronteei eta bero itogarriari.\n\nTokiko zehaztasuna: Bereziki zure hirira egokitutako teknologia.",
  de: "Ein Klima nach Maß\nUnsere Fenster sind speziell für das Klima in Ihrer Region konzipiert. Anhand Ihres genauen Standorts berechnen wir die ideale Wärmeleistung, um im Winter maximale Isolierung und im Sommer angenehme Frische zu gewährleisten.\n\nIhre Vorteile:\n\nEnergieeinsparung: Reduziert die Heiz- und Klimakosten.\n\nAbsoluter Komfort: Verabschieden Sie sich von Zugluft und drückender Hitze.\n\nLokale Präzision: Speziell auf Ihre Stadt abgestimmte Technologie.",
  fr: "Un climat sur mesure\nNos fenêtres sont conçues spécifiquement pour le climat de votre région. En fonction de votre emplacement exact, nous calculons la performance thermique idéale afin de garantir une isolation maximale en hiver et une fraîcheur optimale en été.\n\nVos avantages :\n\nÉconomies d'énergie : Réduisez les dépenses de chauffage et de climatisation.\n\nConfort total : Dites adieu aux courants d'air et à la chaleur étouffante.\n\nPrécision locale : Une technologie adaptée spécifiquement à votre ville.",
  pt: "Clima à sua medida\nAs nossas janelas são concebidas especificamente para o clima da sua zona. Com base na sua localização exata, calculamos o desempenho térmico ideal para garantir o máximo isolamento no inverno e frescura no verão.\n\nOs seus benefícios:\n\nPoupança energética: Reduza os gastos com aquecimento e ar condicionado.\n\nConforto total: Diga adeus às correntes de ar e ao calor sufocante.\n\nPrecisão local: Tecnologia adaptada especificamente à sua cidade."
};

const localesDir = path.join(process.cwd(), 'src', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const lang = path.basename(file, '.json');
  if (translations[lang]) {
    const filePath = path.join(localesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (content.assistant) {
      content.assistant.geoDesc = translations[lang];
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`Updated geoDesc in ${lang}.json`);
    } else {
      console.log(`No 'assistant' object found in ${lang}.json`);
    }
  }
}
