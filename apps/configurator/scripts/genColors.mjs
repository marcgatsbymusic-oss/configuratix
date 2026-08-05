import fs from 'fs';

const langs = ['en', 'es', 'de', 'fr', 'ca', 'pt', 'eu'];

// Dictionary for groups
const groups = {
  'Metal Effect': { en: 'Metal Effect', es: 'Efecto Metal', de: 'Metalleffekt', fr: 'Effet Métal', ca: 'Efecte Metall', pt: 'Efeito Metal', eu: 'Metal Efektua' },
  'Solid': { en: 'Solid', es: 'Sólido', de: 'Vollton', fr: 'Solide', ca: 'Sòlid', pt: 'Sólido', eu: 'Solidoa' },
  'Wood Effect': { en: 'Wood Effect', es: 'Efecto Madera', de: 'Holzeffekt', fr: 'Effet Bois', ca: 'Efecte Fusta', pt: 'Efeito Madeira', eu: 'Egur Efektua' }
};

// Colors mapped to pure image assets from ProductDetails.ts
const colorDict = {
  'c199': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/croviu_platynium-n.jpg')", name: { en: 'Croviu Platynium', es: 'Croviu Platynium', de: 'Croviu Platynium', fr: 'Croviu Platynium', ca: 'Croviu Platynium', pt: 'Croviu Platynium', eu: 'Croviu Platynium' } },
  'c201': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/piryt.jpg')", name: { en: 'Piryt', es: 'Pirita', de: 'Pyrit', fr: 'Pyrite', ca: 'Pirita', pt: 'Pirita', eu: 'Pirita' } },
  
  'c209': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/bazaltowy_szary.jpg')", name: { en: 'Basalt Grey', es: 'Gris Basalto', de: 'Basaltgrau', fr: 'Gris Basalte', ca: 'Gris Basalt', pt: 'Cinza Basalto', eu: 'Basalto grisa' } },
  'c210': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/bazaltowy-szary-gadki.jpg')", name: { en: 'Basalt Grey Gadki', es: 'Gris Basalto Liso', de: 'Basaltgrau Glatt', fr: 'Gris Basalte Lisse', ca: 'Gris Basalt Llis', pt: 'Cinza Basalto Liso', eu: 'Basalto gris leuna' } },
  'c207': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/szary-kwarcytowy.jpg')", name: { en: 'Grey Quartz', es: 'Cuarzo Gris', de: 'Quarzgrau', fr: 'Gris Quartz', ca: 'Quars Gris', pt: 'Cinza Quartzo', eu: 'Kuartzo grisa' } },
  'c208': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/szary-kwarcytowy-gladki.jpg')", name: { en: 'Grey Quartz Smooth', es: 'Cuarzo Gris Liso', de: 'Quarzgrau Glatt', fr: 'Gris Quartz Lisse', ca: 'Quars Gris Llis', pt: 'Cinza Quartzo Liso', eu: 'Kuartzo gris leuna' } },
  'c237': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/stalowy-niebieski_N2imWIS.jpg')", name: { en: 'Steel Blue', es: 'Azul Acero', de: 'Stahlblau', fr: 'Bleu Acier', ca: 'Blau Acer', pt: 'Azul Aço', eu: 'Altzairu urdina' } },
  'c214': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/antracyt.jpg')", name: { en: 'Anthracite', es: 'Antracita', de: 'Anthrazit', fr: 'Anthracite', ca: 'Antracita', pt: 'Antracite', eu: 'Antrazita' } },
  'c216': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/antracut_ulti-matt_www.jpg')", name: { en: 'Anthracite Ulti Matt', es: 'Antracita Ulti Mate', de: 'Anthrazit Ulti Matt', fr: 'Anthracite Ulti Mat', ca: 'Antracita Ulti Mat', pt: 'Antracite Ulti Mate', eu: 'Antrazita Ulti Matea' } },
  'c215': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/antrycyt0gladki.jpg')", name: { en: 'Anthracite Smooth', es: 'Antracita Liso', de: 'Anthrazit Glatt', fr: 'Anthracite Lisse', ca: 'Antracita Llis', pt: 'Antracite Liso', eu: 'Antrazita leuna' } },
  'c218': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/czarny_ulti-matt_www.jpg')", name: { en: 'Black Ulti Matt', es: 'Negro Ulti Mate', de: 'Schwarz Ulti Matt', fr: 'Noir Ulti Mat', ca: 'Negre Ulti Mat', pt: 'Preto Ulti Mate', eu: 'Beltz Ulti Matea' } },
  'c236': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/brylantowo-niebieski.jpg')", name: { en: 'Brilliant Blue', es: 'Azul Brillante', de: 'Brillantblau', fr: 'Bleu Brillant', ca: 'Blau Brillant', pt: 'Azul Brilhante', eu: 'Urdin distiratsua' } },
  'c231': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/braz-czekoladowy.jpg')", name: { en: 'Chocolate Brown', es: 'Marrón Chocolate', de: 'Schokoladenbraun', fr: 'Brun Chocolat', ca: 'Marró Xocolata', pt: 'Marrom Chocolate', eu: 'Txokolate marroia' } },
  'c206': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/betonowy-szary.jpg')", name: { en: 'Concrete Grey', es: 'Gris Hormigón', de: 'Betongrau', fr: 'Gris Béton', ca: 'Gris Formigó', pt: 'Cinza Concreto', eu: 'Hormigoi grisa' } },
  'c200': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/kremowy.jpg')", name: { en: 'Cream', es: 'Crema', de: 'Cremeweiß', fr: 'Crème', ca: 'Crema', pt: 'Creme', eu: 'Krema' } },
  'c234': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/ciemno-zielony.jpg')", name: { en: 'Dark Green', es: 'Verde Oscuro', de: 'Dunkelgrün', fr: 'Vert Foncé', ca: 'Verd Fosc', pt: 'Verde Escuro', eu: 'Berde iluna' } },
  'c235': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/ciemny-czerwony.jpg')", name: { en: 'Dark Red', es: 'Rojo Oscuro', de: 'Dunkelrot', fr: 'Rouge Foncé', ca: 'Vermell Fosc', pt: 'Vermelho Escuro', eu: 'Gorri iluna' } },
  'c233': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/zielen-mchu.jpg')", name: { en: 'Moss Green', es: 'Verde Musgo', de: 'Moosgrün', fr: 'Vert Mousse', ca: 'Verd Molsa', pt: 'Verde Musgo', eu: 'Goroldio berdea' } },
  'c205': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/szary.jpg')", name: { en: 'Grey', es: 'Gris', de: 'Grau', fr: 'Gris', ca: 'Gris', pt: 'Cinza', eu: 'Grisa' } },
  'c217': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/jet-black.jpg')", name: { en: 'Jet Black', es: 'Negro Azabache', de: 'Tiefschwarz', fr: 'Noir Jaïs', ca: 'Negre Atzabeja', pt: 'Preto Azeviche', eu: 'Beltz azabachea' } },
  'c204': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/jasny_szary-n.jpg')", name: { en: 'Light Grey', es: 'Gris Claro', de: 'Lichtgrau', fr: 'Gris Clair', ca: 'Gris Clar', pt: 'Cinza Claro', eu: 'Gris argia' } },
  'c211': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/lupkowy-n.jpg')", name: { en: 'Slate', es: 'Pizarra', de: 'Schiefergrau', fr: 'Ardoise', ca: 'Pissarra', pt: 'Ardósia', eu: 'Arbela' } },
  'c212': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/lupkowy-gladki-n.jpg')", name: { en: 'Slate Smooth', es: 'Pizarra Liso', de: 'Schiefergrau Glatt', fr: 'Ardoise Lisse', ca: 'Pissarra Llis', pt: 'Ardósia Liso', eu: 'Arbel leuna' } },
  'c197': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/bialy-fx.jpg')", name: { en: 'White', es: 'Blanco', de: 'Weiß', fr: 'Blanc', ca: 'Blanc', pt: 'Branco', eu: 'Zuria' } },
  'c198': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/white_sand-u-matt.jpg')", name: { en: 'White Sand Matt', es: 'Blanco Arena Mate', de: 'Weißer Sand Matt', fr: 'Blanc Sable Mat', ca: 'Blanc Sorra Mat', pt: 'Areia Branca Mate', eu: 'Hare zuri matea' } },

  'c232': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/deep_bronze.jpg')", name: { en: 'Deep Bronze', es: 'Bronce Profundo', de: 'Tiefbronze', fr: 'Bronze Profond', ca: 'Bronze Profund', pt: 'Bronze Profundo', eu: 'Brontze sakona' } },
  'c213': { group: 'Metal Effect', swatch: "url('/assets/windowcolors/textures/grafitowy_piaskowany.jpg')", name: { en: 'Graphite Sandblasted', es: 'Grafito Arenado', de: 'Graphit Sandgestrahlt', fr: 'Graphite Sablé', ca: 'Grafit Sorrejat', pt: 'Grafite Jateado', eu: 'Grafito hareatua' } },
  'c228': { group: 'Solid', swatch: "url('/assets/windowcolors/textures/polisander-a.jpg')", name: { en: 'Palisander', es: 'Palisandro', de: 'Palisander', fr: 'Palissandre', ca: 'Palissandre', pt: 'Jacarandá', eu: 'Palisandroa' } },
  'c202': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/dab-bielony.jpg')", name: { en: 'Bleached Oak', es: 'Roble Blanqueado', de: 'Gebleichte Eiche', fr: 'Chêne Blanchi', ca: 'Roure Blanquejat', pt: 'Carvalho Branqueado', eu: 'Haritz zuritua' } },
  'c227': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/ciemny-dab_kk.jpg')", name: { en: 'Dark Oak', es: 'Roble Oscuro', de: 'Dunkle Eiche', fr: 'Chêne Foncé', ca: 'Roure Fosc', pt: 'Carvalho Escuro', eu: 'Haritz iluna' } },
  'c225': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/daglezja_kk.jpg')", name: { en: 'Douglas Fir', es: 'Abeto Douglas', de: 'Douglasie', fr: 'Sapin de Douglas', ca: 'Avet Douglas', pt: 'Abeto de Douglas', eu: 'Douglas izeia' } },
  'c229': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/macore_kk.jpg')", name: { en: 'Macore', es: 'Macoré', de: 'Macore', fr: 'Macoré', ca: 'Macoré', pt: 'Macoré', eu: 'Makore' } },
  'c230': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/machoa_kk.jpg')", name: { en: 'Mahogany', es: 'Caoba', de: 'Mahagoni', fr: 'Acajou', ca: 'Caoba', pt: 'Mogno', eu: 'Kaoba' } },
  'c203': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/dab-naturalny.jpg')", name: { en: 'Natural Oak', es: 'Roble Natural', de: 'Eiche Natur', fr: 'Chêne Naturel', ca: 'Roure Natural', pt: 'Carvalho Natural', eu: 'Haritz naturala' } },
  'c224': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/oregon_kk.jpg')", name: { en: 'Oregon', es: 'Oregón', de: 'Oregon', fr: 'Orégon', ca: 'Oregón', pt: 'Oregon', eu: 'Oregon' } },
  'c220': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/turner-oak-2023.jpg')", name: { en: 'Turner Oak 2023', es: 'Roble Turner 2023', de: 'Turner Eiche 2023', fr: 'Chêne Turner 2023', ca: 'Roure Turner 2023', pt: 'Carvalho Turner 2023', eu: 'Turner haritza 2023' } },
  'c221': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/turner_oak_toffee_470-3004.jpg')", name: { en: 'Turner Oak Toffee 470 3004', es: 'Roble Turner Toffee', de: 'Turner Eiche Toffee', fr: 'Chêne Turner Toffee', ca: 'Roure Turner Toffee', pt: 'Carvalho Turner Toffee', eu: 'Turner Toffee haritza' } },
  'c222': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/turner_oak_walnut_470-3004.jpg')", name: { en: 'Turner Oak Walnut 470 3004', es: 'Roble Turner Nogal', de: 'Turner Eiche Nussbaum', fr: 'Chêne Turner Noyer', ca: 'Roure Turner Noguera', pt: 'Carvalho Turner Nogueira', eu: 'Turner intxaur haritza' } },
  'c226': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/orzech-a.jpg')", name: { en: 'Walnut', es: 'Nogal', de: 'Nussbaum', fr: 'Noyer', ca: 'Noguera', pt: 'Nogueira', eu: 'Intxaurrondoa' } },
  'c223': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/winchester_kk.jpg')", name: { en: 'Winchester', es: 'Winchester', de: 'Winchester', fr: 'Winchester', ca: 'Winchester', pt: 'Winchester', eu: 'Winchester' } },
  'c219': { group: 'Wood Effect', swatch: "url('/assets/windowcolors/textures/zaoty-dab_kk.jpg')", name: { en: 'Golden Oak', es: 'Roble Dorado', de: 'Goldeiche', fr: 'Chêne Doré', ca: 'Roure Daurat', pt: 'Carvalho Dourado', eu: 'Urrezko haritza' } }
};

const finalData = {};

langs.forEach(lang => {
  finalData[lang] = {
    colorGroups: {},
    colors: {}
  };
  
  // map groups
  for (const [key, val] of Object.entries(groups)) {
    finalData[lang].colorGroups[key] = val[lang];
  }
  
  // map colors (inject authentic texture path and localized group metadata)
  for (const [key, val] of Object.entries(colorDict)) {
    finalData[lang].colors[key] = {
      name: val.name[lang],
      group: groups[val.group][lang],
      swatch: val.swatch
    };
  }
});

const base = 'C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle';
fs.writeFileSync(base + '/src/data/colorLocales.json', JSON.stringify(finalData, null, 2));
console.log('Generated src/data/colorLocales.json with Physical Ignore Edge Texture Swatches!');
