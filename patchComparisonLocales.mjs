import fs from 'fs';
import path from 'path';

const localesDir = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\locales';
const locales = ['en', 'de', 'fr', 'pt', 'es', 'nl', 'it', 'pl'];

const newKeys = {
  en: {
    comp: {
      title: "Summary Comparison Table (2026 Context)",
      feature: "Feature",
      pvc: "PVC (uPVC)",
      aluminum: "Aluminum",
      bestFor: "Best For",
      bestForPvc: "Budget, standard sizes, maximum thermal efficiency at low cost.",
      bestForAlu: "Large glass areas, modern aesthetics, longevity, and strength.",
      lifespan: "Lifespan",
      lifespanPvc: "20–30 Years",
      lifespanAlu: "45+ Years",
      cost: "Cost",
      costPvc: "Generally 30%–50% cheaper.",
      costAlu: "Premium price point.",
      aesthetics: "Aesthetics",
      aestheticsPvc: "Bulkier frames.",
      aestheticsAlu: "Slim profiles (more natural light)."
    }
  },
  es: {
    comp: {
      title: "Tabla Resumen Comparativa (Contexto 2026)",
      feature: "Característica",
      pvc: "PVC (uPVC)",
      aluminum: "Aluminio",
      bestFor: "Ideal para",
      bestForPvc: "Presupuestos ajustados, tamaños estándar, máxima eficiencia térmica a bajo coste.",
      bestForAlu: "Grandes superficies acristaladas, estética moderna, longevidad y resistencia.",
      lifespan: "Vida útil",
      lifespanPvc: "20–30 Años",
      lifespanAlu: "45+ Años",
      cost: "Coste",
      costPvc: "Generalmente un 30%–50% más barato.",
      costAlu: "Precio premium.",
      aesthetics: "Estética",
      aestheticsPvc: "Marcos más volumétricos.",
      aestheticsAlu: "Perfiles finos (más luz natural)."
    }
  },
  de: {
    comp: {
      title: "Zusammenfassende Vergleichstabelle (2026 Kontext)",
      feature: "Eigenschaft",
      pvc: "Kunststoff (uPVC)",
      aluminum: "Aluminium",
      bestFor: "Am besten für",
      bestForPvc: "Budget, Standardgrößen, maximale thermische Effizienz bei geringen Kosten.",
      bestForAlu: "Große Glasflächen, moderne Ästhetik, Langlebigkeit und Festigkeit.",
      lifespan: "Lebensdauer",
      lifespanPvc: "20–30 Jahre",
      lifespanAlu: "45+ Jahre",
      cost: "Kosten",
      costPvc: "In der Regel 30%–50% günstiger.",
      costAlu: "Premium-Preisklasse.",
      aesthetics: "Ästhetik",
      aestheticsPvc: "Klobigere Rahmen.",
      aestheticsAlu: "Schmale Profile (mehr natürliches Licht)."
    }
  },
  fr: {
    comp: {
      title: "Tableau Comparatif (Contexte 2026)",
      feature: "Caractéristique",
      pvc: "PVC (uPVC)",
      aluminum: "Aluminium",
      bestFor: "Idéal pour",
      bestForPvc: "Budget, tailles standard, efficacité thermique maximale à faible coût.",
      bestForAlu: "Grandes surfaces vitrées, esthétique moderne, longévité et solidité.",
      lifespan: "Durée de vie",
      lifespanPvc: "20–30 Ans",
      lifespanAlu: "45+ Ans",
      cost: "Coût",
      costPvc: "Généralement 30% à 50% moins cher.",
      costAlu: "Prix premium.",
      aesthetics: "Esthétique",
      aestheticsPvc: "Cadres plus volumineux.",
      aestheticsAlu: "Profilés fins (plus de lumière naturelle)."
    }
  },
  pt: {
    comp: {
      title: "Tabela Resumida de Comparação (Contexto 2026)",
      feature: "Recurso",
      pvc: "PVC (uPVC)",
      aluminum: "Alumínio",
      bestFor: "Melhor para",
      bestForPvc: "Orçamento, tamanhos padrão, máxima eficiência térmica a baixo custo.",
      bestForAlu: "Grandes áreas de vidro, estética moderna, longevidade e resistência.",
      lifespan: "Vida útil",
      lifespanPvc: "20–30 Anos",
      lifespanAlu: "Mais de 45 Anos",
      cost: "Custo",
      costPvc: "Geralmente 30% a 50% mais barato.",
      costAlu: "Ponto de preço premium.",
      aesthetics: "Estética",
      aestheticsPvc: "Quadros mais volumosos.",
      aestheticsAlu: "Perfis finos (mais luz natural)."
    }
  },
  nl: {
    comp: {
      title: "Samenvattende Vergelijkingstabel (2026 Context)",
      feature: "Eigenschap",
      pvc: "PVC (uPVC)",
      aluminum: "Aluminium",
      bestFor: "Beste voor",
      bestForPvc: "Budget, standaardafmetingen, maximale thermische efficiëntie tegen lage kosten.",
      bestForAlu: "Grote glasoppervlakken, moderne esthetiek, levensduur en sterkte.",
      lifespan: "Levensduur",
      lifespanPvc: "20–30 Jaar",
      lifespanAlu: "45+ Jaar",
      cost: "Kosten",
      costPvc: "Meestal 30%–50% goedkoper.",
      costAlu: "Premium prijsklasse.",
      aesthetics: "Esthetiek",
      aestheticsPvc: "Forsere kozijnen.",
      aestheticsAlu: "Slanke profielen (meer natuurlijk licht)."
    }
  },
  it: {
    comp: {
      title: "Tabella Riassuntiva di Confronto (Contesto 2026)",
      feature: "Caratteristica",
      pvc: "PVC (uPVC)",
      aluminum: "Alluminio",
      bestFor: "Ideale per",
      bestForPvc: "Budget, dimensioni standard, massima efficienza termica a basso costo.",
      bestForAlu: "Grandi superfici vetrate, estetica moderna, longevità e resistenza.",
      lifespan: "Durata",
      lifespanPvc: "20–30 Anni",
      lifespanAlu: "45+ Anni",
      cost: "Costo",
      costPvc: "Generalmente 30%–50% più economico.",
      costAlu: "Fascia di prezzo premium.",
      aesthetics: "Estetica",
      aestheticsPvc: "Infissi più ingombranti.",
      aestheticsAlu: "Profili sottili (più luce naturale)."
    }
  },
  pl: {
    comp: {
      title: "Tabela Podsumowująca Porównanie (Kontekst 2026)",
      feature: "Cecha",
      pvc: "PVC (uPVC)",
      aluminum: "Aluminium",
      bestFor: "Najlepsze dla",
      bestForPvc: "Budżetu, standardowych rozmiarów, maksymalnej wydajności termicznej przy niskich kosztach.",
      bestForAlu: "Dużych przeszklonych powierzchni, nowoczesnej estetyki, długowieczności i wytrzymałości.",
      lifespan: "Żywotność",
      lifespanPvc: "20–30 Lat",
      lifespanAlu: "45+ Lat",
      cost: "Koszt",
      costPvc: "Zazwyczaj od 30% do 50% tańsze.",
      costAlu: "Cena premium.",
      aesthetics: "Estetyka",
      aestheticsPvc: "Masywne ramy.",
      aestheticsAlu: "Cienkie profile (więcej naturalnego światła)."
    }
  }
};

locales.forEach(lang => {
  const translations = newKeys[lang] || newKeys['en'];
  const filepath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    if (!data.help) data.help = {};
    data.help.comp = translations.comp;
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
});
console.log('Comparison translations patched!');
