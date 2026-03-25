export interface SwatchColor {
  id: string
  name: string
  hex: string
  image?: string
  windowImage?: string
  group: 'Solid' | 'Wood Effect' | 'Metal Effect' | 'Standard'
}

export interface GlassOption {
  id: string
  name: string
  image: string
  largeImage: string
}

export interface ProductDetailData {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  heroImage: string
  windowPhoto: string
  profileImage: string
  blueprintImage: string
  videoSrc: string
  standardEquipment: string[]
  keySpecs: { label: string; value: string }[]
  colors: SwatchColor[]
  glassOptions: GlassOption[]
  hardware: { id: string; name: string; image: string; type: string }[]
  accessories: { id: string; name: string; image: string; description?: string }[]
}

export const IGLO_EDGE_COLORS: SwatchColor[] = [
  { id: 'c209', name: 'Basalt Grey', image: '/assets/windowcolors/textures/bazaltowy_szary.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-basalto.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c210', name: 'Basalt Grey Gadki', image: '/assets/windowcolors/textures/bazaltowy-szary-gadki.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-basalto-liso.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c232', name: 'Deep Bronze', image: '/assets/windowcolors/textures/deep_bronze.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/shine-deep-bronze-fixed.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c213', name: 'Graphite Sandblasted', image: '/assets/windowcolors/textures/grafitowy_piaskowany.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/grafito-arena-fixed.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c207', name: 'Grey Quartz', image: '/assets/windowcolors/textures/szary-kwarcytowy.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/cuarcita-gris.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c208', name: 'Grey Quartz Smooth', image: '/assets/windowcolors/textures/szary-kwarcytowy-gladki.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-cuarcita-liso.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c237', name: 'Steel Blue', image: '/assets/windowcolors/textures/stalowy-niebieski_N2imWIS.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/azul-acero-fixed.webp', hex: '#404040', group: 'Metal Effect' },
  { id: 'c214', name: 'Anthracite', image: '/assets/windowcolors/textures/antracyt.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/antracita.webp', hex: '#404040', group: 'Solid' },
  { id: 'c216', name: 'Anthracite Ulti Matt', image: '/assets/windowcolors/textures/antracut_ulti-matt_www.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/antracita-ulti-matt.webp', hex: '#404040', group: 'Solid' },
  { id: 'c215', name: 'Anthracite Smooth', image: '/assets/windowcolors/textures/antrycyt0gladki.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/antracita-liso.webp', hex: '#404040', group: 'Solid' },
  { id: 'c218', name: 'Black Ulti Matt', image: '/assets/windowcolors/textures/czarny_ulti-matt_www.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/negro-ulti-matt.webp', hex: '#404040', group: 'Solid' },
  { id: 'c236', name: 'Brilliant Blue', image: '/assets/windowcolors/textures/brylantowo-niebieski.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/brylantowo-niebieski.webp', hex: '#404040', group: 'Solid' },
  { id: 'c231', name: 'Chocolate Brown', image: '/assets/windowcolors/textures/braz-czekoladowy.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/marr-n-chocolate.webp', hex: '#404040', group: 'Solid' },
  { id: 'c206', name: 'Concrete Grey', image: '/assets/windowcolors/textures/betonowy-szary.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-hormig-n.webp', hex: '#404040', group: 'Solid' },
  { id: 'c200', name: 'Cream', image: '/assets/windowcolors/textures/kremowy.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/crema.webp', hex: '#404040', group: 'Solid' },
  { id: 'c199', name: 'Croviu Platynium', image: '/assets/windowcolors/textures/croviu_platynium-n.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/corona-platino.webp', hex: '#404040', group: 'Solid' },
  { id: 'c234', name: 'Dark Green', image: '/assets/windowcolors/textures/ciemno-zielony.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/verde-oscuro.webp', hex: '#404040', group: 'Solid' },
  { id: 'c235', name: 'Dark Red', image: '/assets/windowcolors/textures/ciemny-czerwony.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/rojo-oscuro.webp', hex: '#404040', group: 'Solid' },
  { id: 'c233', name: 'Moss Green', image: '/assets/windowcolors/textures/zielen-mchu.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/verde-musgo.webp', hex: '#404040', group: 'Solid' },
  { id: 'c205', name: 'Grey', image: '/assets/windowcolors/textures/szary.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris.webp', hex: '#404040', group: 'Solid' },
  { id: 'c217', name: 'Jet Black', image: '/assets/windowcolors/textures/jet-black.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/jet-black.webp', hex: '#404040', group: 'Solid' },
  { id: 'c204', name: 'Light Grey', image: '/assets/windowcolors/textures/jasny_szary-n.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-claro.webp', hex: '#404040', group: 'Solid' },
  { id: 'c201', name: 'Piryt', image: '/assets/windowcolors/textures/piryt.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/pirita.webp', hex: '#404040', group: 'Solid' },
  { id: 'c228', name: 'Palisander', image: '/assets/windowcolors/textures/polisander-a.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/palisandro.webp', hex: '#404040', group: 'Solid' },
  { id: 'c211', name: 'Slate', image: '/assets/windowcolors/textures/lupkowy-n.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/pizarra.webp', hex: '#404040', group: 'Solid' },
  { id: 'c212', name: 'Slate Smooth', image: '/assets/windowcolors/textures/lupkowy-gladki-n.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-pizarra-liso.webp', hex: '#404040', group: 'Solid' },
  { id: 'c197', name: 'White', image: '/assets/windowcolors/textures/bialy-fx.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp', hex: '#404040', group: 'Solid' },
  { id: 'c198', name: 'White Sand Matt', image: '/assets/windowcolors/textures/white_sand-u-matt.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/white-sand-u-matt.webp', hex: '#404040', group: 'Solid' },
  { id: 'c202', name: 'Bleached Oak', image: '/assets/windowcolors/textures/dab-bielony.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/roble-blanqueado.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c227', name: 'Dark Oak', image: '/assets/windowcolors/textures/ciemny-dab_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/roble-oscuro.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c225', name: 'Douglas Fir', image: '/assets/windowcolors/textures/daglezja_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/abeto-douglas.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c229', name: 'Macore', image: '/assets/windowcolors/textures/macore_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/macor.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c230', name: 'Mahogany', image: '/assets/windowcolors/textures/machoa_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/caoba.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c203', name: 'Natural Oak', image: '/assets/windowcolors/textures/dab-naturalny.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/roble-natural.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c224', name: 'Oregon', image: '/assets/windowcolors/textures/oregon_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/oregon.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c220', name: 'Turner Oak 2023', image: '/assets/windowcolors/textures/turner-oak-2023.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/roble-turner.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c221', name: 'Turner Oak Toffee 470 3004', image: '/assets/windowcolors/textures/turner_oak_toffee_470-3004.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/turner-oak-toffee.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c222', name: 'Turner Oak Walnut 470 3004', image: '/assets/windowcolors/textures/turner_oak_walnut_470-3004.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/turner-oak-walnut.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c226', name: 'Walnut', image: '/assets/windowcolors/textures/orzech-a.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/nogal.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c223', name: 'Winchester', image: '/assets/windowcolors/textures/winchester_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/winchester.webp', hex: '#404040', group: 'Wood Effect' },
  { id: 'c219', name: 'Golden Oak', image: '/assets/windowcolors/textures/zaoty-dab_kk.jpg', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/roble-dorado.webp', hex: '#404040', group: 'Wood Effect' },
]

export const IGLO_EDGE_DETAIL: ProductDetailData = {
  id: 'p1',
  slug: 'iglo-edge',
  name: 'IGLO EDGE',
  tagline: 'Maximum insulation, minimal frame',
  description: 'Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0.66 W/(m²K)* and a modern, angular profile shape. The extremely good thermal insulation parameters are due, among other things, to the 7-chamber profile design and 3 EPDM gaskets, including the central gasket.',
  heroImage: '/assets/hero.png',
  windowPhoto: '/assets/iglo-edge-featured.png',
  profileImage: '/assets/iglo-edge-profile-photo.png',
  blueprintImage: '/assets/iglo-edge-technical-drawing.png',
  videoSrc: '/assets/iglo-edge-animation.mp4',
  standardEquipment: [
    'Double-chamber glazing package Ug = 0.5 W/(m²K)',
    'Swisspacer Ultimate plastic warm frame',
    'V-perfect weld',
    '4 anti-theft strikers according to the size of the sash and the hardware system',
    'Microventilation',
    'DUBLIN aluminium window handle',
    'Handle misplacement locking mechanism',
    'Perimeter, glazing and central gaskets in black or grey',
    'Filling of the lower hardware groove',
    'Sill trim',
    'Wide selection of PVC veneer colours',
    '3 profile colours to choose from: white, brown or anthracite',
  ],
  keySpecs: [
    { label: 'sound', value: '36–47 dB' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.66 W/(m²K)*' },
    { label: 'chambers', value: '7' },
    { label: 'depth', value: '82 mm' },
    { label: 'class', value: 'A' },
  ],
  colors: IGLO_EDGE_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33,1 segura',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33,2 segura film mate',     image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: '44,4 antirrobo',            image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g4',  name: 'Antisol Dark Blue 6',       image: '/assets/glass/thumbs/antisol-blue-6.webp',      largeImage: '/assets/glass/large/antisol-blue-6.jpg' },
    { id: 'g5',  name: 'Antisol gris 6',            image: '/assets/glass/thumbs/antisol-grey-6.webp',      largeImage: '/assets/glass/large/antisol-grey-6.jpg' },
    { id: 'g6',  name: 'Antisol marrón 4',          image: '/assets/glass/thumbs/antisol-brown-4.webp',     largeImage: '/assets/glass/large/antisol-brown-4.jpg' },
    { id: 'g7',  name: 'Antisol marrón 6',          image: '/assets/glass/thumbs/antisol-brown-6.webp',     largeImage: '/assets/glass/large/antisol-brown-6.jpg' },
    { id: 'g8',  name: 'Antisol verde 4',           image: '/assets/glass/thumbs/antisol-green-4.webp',     largeImage: '/assets/glass/large/antisol-green-4.jpg' },
    { id: 'g9',  name: 'Antisol verde 6',           image: '/assets/glass/thumbs/antisol-green-6.webp',     largeImage: '/assets/glass/large/antisol-green-6.jpg' },
    { id: 'g10', name: 'Chinchilla blanco 4',       image: '/assets/glass/thumbs/chinchilla-4.webp',        largeImage: '/assets/glass/large/chinchilla-4.jpg' },
    { id: 'g11', name: 'Float 4',                   image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' },
    { id: 'g12', name: 'Float 6',                   image: '/assets/glass/thumbs/float-6.webp',             largeImage: '/assets/glass/large/float-6.jpg' },
    { id: 'g13', name: 'Mirastar',                  image: '/assets/glass/thumbs/mirastar.webp',            largeImage: '/assets/glass/large/mirastar.jpg' },
    { id: 'g14', name: 'Ornamento Cathedral',       image: '/assets/glass/thumbs/ornamento-cathedral.webp', largeImage: '/assets/glass/large/ornamento-cathedral.jpg' },
    { id: 'g15', name: 'Ornamento Delta 4',         image: '/assets/glass/thumbs/ornamento-delta.webp',     largeImage: '/assets/glass/large/ornamento-delta.jpg' },
    { id: 'g16', name: 'Ornamento Master Carré',    image: '/assets/glass/thumbs/ornamento-master.webp',    largeImage: '/assets/glass/large/ornamento-master.jpg' },
    { id: 'g17', name: 'Ornamento Silvit 4',        image: '/assets/glass/thumbs/ornamento-silvit.webp',    largeImage: '/assets/glass/large/ornamento-silvit.jpg' },
    { id: 'g18', name: 'Stopsol azul 6',            image: '/assets/glass/thumbs/stopsol-blue-6.webp',      largeImage: '/assets/glass/large/stopsol-blue-6.jpg' },
    { id: 'g19', name: 'Stopsol marrón 6',          image: '/assets/glass/thumbs/stopsol-brown-6.webp',     largeImage: '/assets/glass/large/stopsol-brown-6.jpg' },
    { id: 'g20', name: 'Waterfall 105',             image: '/assets/glass/thumbs/waterfall-105.webp',       largeImage: '/assets/glass/large/waterfall-105.jpg' },
  ],
  hardware: [
    { id: 'h1', name: 'Standard Handle', type: 'Aluminum', image: 'https://www.drutex.es/images/produkty/klamki/klamka-standardowa-aluminiowa.jpg' },
    { id: 'h2', name: 'Handle with Key', type: 'Security', image: 'https://www.drutex.es/images/produkty/klamki/klamka-z-kluczykiem.jpg' },
    { id: 'h3', name: 'Secustik®', type: 'Anti-burglary', image: 'https://www.drutex.es/images/produkty/klamki/klamka-secustik.jpg' },
  ],
  accessories: [
    { id: 'a1', name: 'Maco Multi Matic KS', description: 'Advanced perimeter hardware with micro-ventilation', image: 'https://www.drutex.es/images/produkty/okucia/okucie-maco.jpg' },
    { id: 'a2', name: 'V-Perfect Welding', description: 'Virtually invisible corner welds for flawless aesthetics', image: 'https://www.drutex.es/images/produkty/inne/v-perfect.jpg' },
    { id: 'a3', name: 'Steel Reinforcement', description: 'Closed steel profile in the frame for extreme rigidity', image: 'https://www.drutex.es/images/produkty/inne/wzmocnienie-stalowe.jpg' },
    { id: 'a4', name: 'EPDM Seals', description: 'Triple sealing system in black or grey', image: 'https://www.drutex.es/images/produkty/inne/uszczelki-epdm.jpg' },
  ]
}
