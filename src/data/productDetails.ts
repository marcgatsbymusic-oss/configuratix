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
  modalVideoSrc?: string
  disableHeroFilter?: boolean
  standardEquipment: string[]
  keySpecs: { label: string; value: string }[]
  colors: SwatchColor[]
  outdoorColors?: SwatchColor[]
  outdoorWindowPhoto?: string
  inlineVideoSrc?: string
  inlineImageSrc?: string
  features?: { title: string; description: string; image: string }[]
  relatedProductLink?: { text: string; url: string }
  glassOptions: GlassOption[]
  hardware: { id: string; name: string; image: string; type: string }[]
  accessories: { id: string; name: string; image: string; description?: string }[]
  equipmentVideoLink?: {
    afterItemMatch: string;
    label: string;
    url: string;
  }
  profileVariants?: { name: string; image: string }[]
  weldingSection?: {
    videos: string[];
    description: string;
  }
  infills?: {
    name: string;
    image: string;
    largeImage: string;
  }[]
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


export const IGLO_EDGE_SLIDE_COLORS: SwatchColor[] = [

];


export const IGLO_EDGE_DETAIL: ProductDetailData = {
  id: 'p1',
  slug: 'iglo-edge',
  name: 'IGLO EDGE',
  tagline: 'Maximum insulation, minimal frame',
  description: `Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0.66 W/(m²K)* and a modern, angular profile shape. The extremely good thermal insulation parameters are due, among other things, to the 7-chamber profile design and 3 EPDM gaskets, including the central gasket.`,
  heroImage: '/assets/hero.png',
  windowPhoto: '/assets/iglo-edge-featured.png',
  profileImage: '/assets/iglo-edge-profile-photo.png',
  blueprintImage: '/assets/iglo-edge-technical-drawing.png',
  videoSrc: '/assets/heroes/iglo-edge-header-cover.mp4',
  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',
  inlineVideoSrc: '/assets/products/iglo-edge-okno-window-opening.mp4',
  relatedProductLink: { text: 'relatedIgloEdge', url: '/products/iglo-edge-slide' },
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
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 ("safety") matt film',     image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: '44.4 anti-burglary',            image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g4',  name: 'Antisol Dark Blue 6',       image: '/assets/glass/thumbs/antisol-blue-6.webp',      largeImage: '/assets/glass/large/antisol-blue-6.jpg' },
    { id: 'g5',  name: 'Antisol grey 6',            image: '/assets/glass/thumbs/antisol-grey-6.webp',      largeImage: '/assets/glass/large/antisol-grey-6.jpg' },
    { id: 'g6',  name: 'Antisol brown 4',          image: '/assets/glass/thumbs/antisol-brown-4.webp',     largeImage: '/assets/glass/large/antisol-brown-4.jpg' },
    { id: 'g7',  name: 'Antisol brown 6',          image: '/assets/glass/thumbs/antisol-brown-6.webp',     largeImage: '/assets/glass/large/antisol-brown-6.jpg' },
    { id: 'g8',  name: 'Antisol green 4',           image: '/assets/glass/thumbs/antisol-green-4.webp',     largeImage: '/assets/glass/large/antisol-green-4.jpg' },
    { id: 'g9',  name: 'Antisol green 6',           image: '/assets/glass/thumbs/antisol-green-6.webp',     largeImage: '/assets/glass/large/antisol-green-6.jpg' },
    { id: 'g10', name: 'Chinchilla white 4',       image: '/assets/glass/thumbs/chinchilla-4.webp',        largeImage: '/assets/glass/large/chinchilla-4.jpg' },
    { id: 'g11', name: 'Float 4',                   image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' },
    { id: 'g12', name: 'Float 6',                   image: '/assets/glass/thumbs/float-6.webp',             largeImage: '/assets/glass/large/float-6.jpg' },
    { id: 'g13', name: 'Mirastar',                  image: '/assets/glass/thumbs/mirastar.webp',            largeImage: '/assets/glass/large/mirastar.jpg' },
    { id: 'g14', name: 'Ornament Cathedral',       image: '/assets/glass/thumbs/ornamento-cathedral.webp', largeImage: '/assets/glass/large/ornamento-cathedral.jpg' },
    { id: 'g15', name: 'Ornament Delta 4',         image: '/assets/glass/thumbs/ornamento-delta.webp',     largeImage: '/assets/glass/large/ornamento-delta.jpg' },
    { id: 'g16', name: 'Ornament Master Carre',    image: '/assets/glass/thumbs/ornamento-master.webp',    largeImage: '/assets/glass/large/ornamento-master.jpg' },
    { id: 'g17', name: 'Ornament Silvit 4',        image: '/assets/glass/thumbs/ornamento-silvit.webp',    largeImage: '/assets/glass/large/ornamento-silvit.jpg' },
    { id: 'g18', name: 'Stopsol blue 6',            image: '/assets/glass/thumbs/stopsol-blue-6.webp',      largeImage: '/assets/glass/large/stopsol-blue-6.jpg' },
    { id: 'g19', name: 'Stopsol brown 6',          image: '/assets/glass/thumbs/stopsol-brown-6.webp',     largeImage: '/assets/glass/large/stopsol-brown-6.jpg' },
    { id: 'g20', name: 'Waterfall 105',             image: '/assets/glass/thumbs/waterfall-105.webp',       largeImage: '/assets/glass/large/waterfall-105.jpg' },
  ],
  hardware: [
    { id: 'h1', name: 'Standard Handle', type: 'Aluminum', image: 'https://www.drutex.es/images/produkty/klamki/klamka-standardowa-aluminiowa.jpg' },
    { id: 'h2', name: 'Handle with Key', type: 'Security', image: 'https://www.drutex.es/images/produkty/klamki/klamka-z-kluczykiem.jpg' },
    { id: 'h3', name: 'Secustik®', type: 'Anti-burglary', image: 'https://www.drutex.es/images/produkty/klamki/klamka-secustik.jpg' },
  ],
  accessories: [
    { id: 'a1', name: 'Maco Multi Matic KS', description: `Advanced perimeter hardware with micro-ventilation`, image: 'https://www.drutex.es/images/produkty/okucia/okucie-maco.jpg' },
    { id: 'a2', name: 'V-Perfect Welding', description: `Virtually invisible corner welds for flawless aesthetics`, image: 'https://www.drutex.es/images/produkty/inne/v-perfect.jpg' },
    { id: 'a3', name: 'Steel Reinforcement', description: `Closed steel profile in the frame for extreme rigidity`, image: 'https://www.drutex.es/images/produkty/inne/wzmocnienie-stalowe.jpg' },
    { id: 'a4', name: 'EPDM Seals', description: `Triple sealing system in black or grey`, image: 'https://www.drutex.es/images/produkty/inne/uszczelki-epdm.jpg' },
  ]
}


export const IGLO_EDGE_SLIDE_DETAIL: ProductDetailData = {
  id: 'p1_slide',
  slug: 'iglo-edge-slide',
  name: 'IGLO EDGE SLIDE',
  tagline: 'Technology That Impresses',
  description: `Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0,65 W/(m2K)* and a modern, angular profile shape.`,
  heroImage: '/assets/iglo-edge-slide-profile.png',
  heroVideoSrc: '/assets/iglo-edge-slide-hero.mp4',
  windowPhoto: '/assets/iglo-edge-slide-profile.png',
  profileImage: '/assets/iglo-edge-slide-profile.png',
  blueprintImage: '/assets/iglo-edge-slide-cross-section.png',
  videoSrc: '/assets/iglo-edge-slide-product.mp4',
  modalVideoSrc: '/assets/iglo_edge_slide-en-web.mp4',
  disableHeroFilter: true,
  standardEquipment: [
    'double-chamber glazing package Ug = 0,5 W/(m2K)',
    'Swisspacer Ultimate warm edge',
    'V-Perfect weld',
    'perimeter and glazing gasket in black or grey',
    'central gasket in black',
    'wide selection of pvc veneer colours',
    'aluminium handle inside',
    'aluminium pull handle outside',
  ],
  keySpecs: [
    { label: 'Thermal Transmittance (Uw)', value: '0.65 W/(m2K)' },
    { label: 'Installation Depth (Frame)', value: '163 mm' },
    { label: 'Installation Depth (Sash)', value: '82 mm' },
    { label: 'Profile Chambers', value: '6' },
    { label: 'Gaskets', value: '3' },
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_SLIDE_COLORS,
  glassOptions: []
};



export const IGLO_HS_DETAIL: ProductDetailData = {
  id: 'p_iglo-hs',
  slug: 'iglo-hs',
  name: 'IGLO-HS',
  tagline: 'Technology That Impresses',
  description: `Uw = 0,71 W/(m2K)**for a structure measuring 2,700 x 2,300 with T4 glass + 18 Swisspacer Ultimate + FL4 + 18 Swisspacer Ultimate + T4`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "aluminium handle on the inside, recessed pull handle on the outside",
    "profile core in white colour"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_HS_ALUCOVER_DETAIL: ProductDetailData = {
  id: 'p_iglo-hs-alucover',
  slug: 'iglo-hs-alucover',
  name: 'IGLO-HS ALUCOVER',
  tagline: 'Technology That Impresses',
  description: `The IGLO-HS Alucover lift-and-slide door system is a solution designed for modern architecture and large terrace glazing. The structure combines the robustness of IGLO-HS profiles with an elegant aluminium cladding on the exterior side, ensuring high durability, resistance to weather conditions and outstanding aesthetics.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "aluminum handle",
    "V-Perfect weld"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const MB_77HS_DETAIL: ProductDetailData = {
  id: 'p_mb-77hs',
  slug: 'mb-77hs',
  name: 'MB-77HS HI',
  tagline: 'Technology That Impresses',
  description: `These aluminium terrace systems are an ideal solution to create trendy, large-size terrace and balcony glazing to give interiors a unique feel. With their extremely durable structure, you can use leaves up to 400 kg. A low aluminium threshold that can be hidden in the floor adds to its excellent functionality.
Standard:`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "aluminium handle on the inside, recessed grip on the outside",
    "glass-pane spacer made of galvanised steel",
    "2 EPDM gaskets in black (external and internal)"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const MB_77HS_MONORAIL_DETAIL: ProductDetailData = {
  id: 'p_mb-77hs-monorail',
  slug: 'mb-77hs-monorail',
  name: 'MB-77HS HI MONORAIL',
  tagline: 'Technology That Impresses',
  description: `The MB-77HS HI MONORAIL "Lift & Slide" door product is an ideal solution for connecting interior space rooms or conservatories with the outside balcony, terrace or garden area.
Standard:`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "aluminium handle on the inside, recessed grip on the outside",
    "glass-pane spacer made of galvanised steel",
    "2 EPDM gaskets in black (external and internal)"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const SOFTLINE_HS_DETAIL: ProductDetailData = {
  id: 'p_softline-hs',
  slug: 'softline-hs',
  name: 'SOFTLINE HS',
  tagline: 'Technology That Impresses',
  description: `This wooden lift and slide terrace door is designed for large-size glazing to ensure the right amount of daylight in rooms. The modern production technology ensures the highest aesthetic values and quality.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const DUOLINE_HS_DETAIL: ProductDetailData = {
  id: 'p_duoline-hs',
  slug: 'duoline-hs',
  name: 'DUOLINE HS',
  tagline: 'Technology That Impresses',
  description: `Choose the colour that suits you from over 200 RAL colours for the aluminium part of the window and a dozen colours of opaque paints (covering the entire wood structure) and stain paints for the wooden part of the window.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_SLIDE_DETAIL: ProductDetailData = {
  id: 'p_iglo-slide',
  slug: 'iglo-slide',
  name: 'IGLO SLIDE',
  tagline: 'Technology That Impresses',
  description: `The system is designed for producing terrace doors and sliding windows. Thanks to the application of the latest technological solutions, it ensures high comfort of use and durability for many years. It is ideal for rooms where the use of traditional window and door solutions is not possible. IGLO SLIDE is dedicated for locations where high thermal insulation parameters are not required.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "Handles - Pull handles",
    "3 types of aluminium handles",
    "Black Gaskets"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const MB_SLIDE_DETAIL: ProductDetailData = {
  id: 'p_mb-slide',
  slug: 'mb-slide',
  name: 'MB - SLIDE',
  tagline: 'Technology That Impresses',
  description: `The system is designed to construct thermally insulated sliding doors and windows. Thanks to it unique construction it may be built in brick walls, aluminium façades, winter gardens or casement elements. Maximum dimensions of leaves: H: 2500 mm, L: 1800 mm, max. weight 160 kg.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const COR_VISION_DETAIL: ProductDetailData = {
  id: 'p_cor-vision',
  slug: 'cor-vision',
  name: 'COR VISION',
  tagline: 'Technology That Impresses',
  description: `Minimalist sliding system with thermal baffle, offering maximum room illumination with a minimally visible aluminum structure. The width of the aluminum mullion is only 20 mm and offers the possibility of hiding it in the frame.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const COR_VISION_PLUS_DETAIL: ProductDetailData = {
  id: 'p_cor-vision-plus',
  slug: 'cor-vision-plus',
  name: 'COR VISION PLUS',
  tagline: 'Technology That Impresses',
  description: `Premium terrace system offering excellent thermal insulation and modern design.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const MB_86_FOLD_LINE_DETAIL: ProductDetailData = {
  id: 'p_mb-86-fold-line',
  slug: 'mb-86-fold-line',
  name: 'MB-86 Fold Line HD',
  tagline: 'Technology That Impresses',
  description: `This unique folding system will be ideal for rooms that require large-size glazing such as balconies or terraces. Featuring the latest technological solutions, the system stands out for not only very good thermal insulation but also remarkable durability.
Standard:`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "aluminium handle",
    "glass-pane spacer made of galvanised steel",
    "2 EPDM gaskets (external and internal), gaskets available in black"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const SOFTLINE_68_FOLDING_DETAIL: ProductDetailData = {
  id: 'p_softline-68-folding',
  slug: 'softline-68-folding',
  name: 'SOFTLINE 68',
  tagline: 'Technology That Impresses',
  description: `* for terrace system 2900x2450 mm with glass Ug=0,8 W/(m2K) + plastic spacer Swisspacer Ultimate - calculation method`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_ENERGY_PSK_DETAIL: ProductDetailData = {
  id: 'p_iglo-energy-psk',
  slug: 'iglo-energy-psk',
  name: 'IGLO ENERGY PSK',
  tagline: 'Technology That Impresses',
  description: `This 7-chamber tilt and slide half aligned terrace system with excellent thermal insulation properties will give every flat a unique feel. Innovative solutions and excellent thermal insulation properties ensure lower heating bills.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "profile core in white",
    "galvanised steel glass-pane spacer optional Swisspacer Ultimate glass-pane spacer",
    "gasket filling the lower fittings groove",
    "aluminium handle",
    "5-chamber PVC under-sill trim with a gasket"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_ENERGY_CLASSIC_PSK_DETAIL: ProductDetailData = {
  id: 'p_iglo-energy-classic-psk',
  slug: 'iglo-energy-classic-psk',
  name: 'IGLO ENERGY CLASSIC PSK',
  tagline: 'Technology That Impresses',
  description: `Class A 7-chamber profile, made exclusively from virgin material. Our proprietary system provides optimum light to both large and small rooms, while maintaining exceptional thermal insulation parameters to significantly reduce heating bills.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "profile core in white",
    "galvanised steel glass-pane spacer optional Swisspacer Ultimate glass-pane spacer",
    "gasket filling the lower fittings groove",
    "aluminium handle",
    "5-chamber PVC under-sill trim with a gasket"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO5_PSK_DETAIL: ProductDetailData = {
  id: 'p_iglo5-psk',
  slug: 'iglo5-psk',
  name: 'IGLO5 PSK',
  tagline: 'Technology That Impresses',
  description: `Uw = 0,81 W/(m2K)**for a structure measuring 2,700 x 2,300 mm with T4 glass + 18 Swisspacer Ultimate + FL4 + 18 Swisspacer Ultimate + T4`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "profile core in white",
    "galvanised steel glass-pane spacer optional Swisspacer Ultimate glass-pane spacer",
    "frame profile height 75 mm",
    "2 EPDM gaskets in black (external and internal)",
    "gasket filling the lower fittings groove",
    "aluminium handle, available with key option",
    "5-chamber PVC under-sill trim with gasket"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO5_CLASSIC_PSK_DETAIL: ProductDetailData = {
  id: 'p_iglo5-classic-psk',
  slug: 'iglo5-classic-psk',
  name: 'IGLO 5 CLASSIC PSK',
  tagline: 'Technology That Impresses',
  description: `Perfect solution, that ensures big access to daylight both in small and big rooms, maintaining great thermal insulation at the same time.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "profile core in white",
    "galvanised steel glass-pane spacer optional Swisspacer Ultimate glass-pane spacer",
    "frame profile height 75 mm",
    "2 EPDM gaskets in black (external and internal)",
    "gasket filling the lower fittings groove",
    "aluminium handle, available with key option",
    "5-chamber PVC under-sill trim with gasket"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_LIGHT_PSK_DETAIL: ProductDetailData = {
  id: 'p_iglo-light-psk',
  slug: 'iglo-light-psk',
  name: 'IGLO LIGHT PSK',
  tagline: 'Technology That Impresses',
  description: `A unique terrace system design to provide plenty of daylight in rooms while maintaining excellent energy efficiency parameters.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes",
    "profile core in white",
    "galvanised steel glass-pane spacer optional Swisspacer Ultimate glass-pane spacer",
    "frame profile height 75 mm",
    "2 EPDM gaskets in black (external and internal)",
    "gasket filling the lower fittings groove",
    "aluminium handle, available with key option",
    "5-chamber PVC under-sill trim with gasket"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const MB_70_PSK_DETAIL: ProductDetailData = {
  id: 'p_mb-70-psk',
  slug: 'mb-70-psk',
  name: 'MB-70 and MB-70HI PSK',
  tagline: 'Technology That Impresses',
  description: `A terrace system to transform every interior and highlight the unique architectural style of a building. Customers across the globe appreciated the highest quality and reliability of the product, including numerous additional options for full product customisation.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const SOFTLINE_PSK_DETAIL: ProductDetailData = {
  id: 'p_softline-psk',
  slug: 'softline-psk',
  name: 'Softline PSK',
  tagline: 'Technology That Impresses',
  description: `This wooden lift and slide terrace door is designed for large-size glazing to ensure the right amount of daylight in rooms. The modern production technology ensures the highest aesthetic values and quality.`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const DUOLINE_PSK_DETAIL: ProductDetailData = {
  id: 'p_duoline-psk',
  slug: 'duoline-psk',
  name: 'DUOLINE PSK',
  tagline: 'Technology That Impresses',
  description: `PINE DL68 Uw=0,93 *1
PINE DL78 Uw=0,75 *2
MERANTI DL68 Uw=0,90 *1
MERANTI DL78 Uw=0,71 *2`,
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: [
    "Glass panes"
],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_ENERGY_DETAIL: ProductDetailData = {
  id: 'p2',
  slug: 'iglo-energy',
  name: 'IGLO Energy',
  tagline: 'An innovative and original 7-chamber A-class profile',
  description: `An innovative and original 7-chamber A-class profile made exclusively of primary materials. The world's first system using a central gasket made of foamed EPDM to ensure the best energy efficiency parameters. Iglo Energy windows also stand out for their perfect parameters in terms of water tightness, microventilation and resistance to wind.`,
  heroImage: '/assets/products/iglo_energy_pr.png',
  windowPhoto: '/assets/products/iglo_energy_pr.png',
  profileImage: '/assets/products/iglo_energy_pr.png',
  blueprintImage: '/assets/tech/iglo_energy.png',
  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',
  modalVideoSrc: '/assets/products/iglo_energy_animacja-2024-en.mp4',
  disableHeroFilter: false,
  features: [
    {
      title: 'aluCoverTitle',
      description: 'aluCoverDesc',
      image: '/assets/features/alu-cover-feature.jpg'
    }
  ],
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours",
    "Profile available in two colours: white, brown"
  ],
  keySpecs: [
    { label: 'sound', value: 'dB = 37-46' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.71 W/(m²K)*' },
    { label: 'chambers', value: '7' },
    { label: 'depth', value: '82 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_ENERGY_CLASSIC_DETAIL: ProductDetailData = {
  id: 'p3',
  slug: 'iglo-energy-classic',
  name: 'IGLO Energy Classic',
  tagline: 'A unique design with exceptional thermal insulation',
  description: `A unique design where you can choose the square-shaped glazing bead to reflect the latest architectural trends. The remarkable thermal insulation parameters are ensured by the optimum 7-chamber profile structure, a specially designed sealing system made of foamed EPDM and glass packages with high thermal insulation parameters.`,
  heroImage: '/assets/products/iglo_energy_classic_pr.png',
  windowPhoto: '/assets/products/iglo_energy_classic_pr.png',
  profileImage: '/assets/products/iglo_energy_classic_pr.png',
  blueprintImage: '/assets/tech/iglo_energy_classic.png',
  videoSrc: '/assets/heroes/iglo-energy-classic-cover.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/produkty/iglo5/film_hd/iglo_5_animacja_-_angielska_-_03-06-2020_web.mp4',
  inlineVideoSrc: '/assets/products/iglo_energy_classic_anim_antracyt.mp4',
  disableHeroFilter: false,
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "V-perfect weld",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours"
  ],
  keySpecs: [
    { label: 'sound', value: 'dB = 37-46' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.71 W/(m²K)*' },
    { label: 'chambers', value: '7' },
    { label: 'depth', value: '82 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const RAL_COLORS: SwatchColor[] = [
  { id: 'ral-7016', name: 'Anthracite Grey (RAL 7016)', hex: '#373f43', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/antracita.webp' },
  { id: 'ral-9016', name: 'Traffic White (RAL 9016)', hex: '#f4f4f4', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-9005', name: 'Jet Black (RAL 9005)', hex: '#0a0a0a', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/negro-madera.webp' },
  { id: 'ral-7035', name: 'Light Grey (RAL 7035)', hex: '#c5c7c4', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-claro.webp' },
  { id: 'ral-8014', name: 'Sepia Brown (RAL 8014)', hex: '#49392d', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/marron-chocolate.webp' }
];

export const IGLO_ENERGY_ALUCOVER_DETAIL: ProductDetailData = {
  id: 'p4',
  slug: 'iglo-energy-alucover',
  name: 'IGLO Energy Alu Cover',
  tagline: 'Modern aluminum look with PVC insulation',
  description: `The system combines the excellent thermal insulation parameters of PVC windows with the modern design of aluminum windows. The aluminum cover on the outside of the profile gives the windows a sleek, modern appearance while maintaining the energy efficiency of the 7-chamber PVC profile.`,
  heroImage: '/assets/products/iglo_energy_alucover_pr.png',
  windowPhoto: '/assets/products/iglo_energy_alucover_pr.png',
  outdoorWindowPhoto: '/assets/products/iglo_energy_alucover_pr.png',
  profileImage: '/assets/tech/iglo-energy-alucover-profil-swisspacer.png',
  blueprintImage: '/assets/products/iglo_energy_alucover_pr.png',
  videoSrc: '/assets/heroes/okno_-_iglo_energy_alu_cover_-_mobile.mp4',
  modalVideoSrc: '',
  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',
  relatedProductLink: { text: 'relatedAlucover', url: '/products/iglo-hs-alucover' },
  disableHeroFilter: false,
  features: [{title: 'aluCoverTitle', description: 'aluCoverDesc', image: '/assets/features/alu-cover-feature.jpg'}],
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "Aluminum cover on the outside of the profile",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours for the inside",
    "Over 200 RAL colours for the aluminum cover"
  ],
  keySpecs: [
    { label: 'sound', value: 'dB = 37-46' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.71 W/(m²K)*' },
    { label: 'chambers', value: '7' },
    { label: 'depth', value: '82 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  outdoorColors: RAL_COLORS,
  glassOptions: []
};

export const IGLO_5_DETAIL: ProductDetailData = {
  id: 'p5',
  slug: 'iglo-5',
  name: 'IGLO 5',
  tagline: 'High quality at an attractive price',
  description: 'A 5-chamber system features very good thermal insulation parameters. Our innovative solution is based on a snow-white A-class profile made exclusively of primary materials to ensure the highest quality. These windows are perfect for both warm and cold climates.',
  heroImage: '/assets/products/iglo-5-hero.png',
  windowPhoto: '/assets/products/iglo-5-window.png',
  profileImage: '/assets/products/iglo-5-profile.png',
  blueprintImage: '/assets/products/iglo-5-blueprint.png',
  videoSrc: '/assets/heroes/iglo-5-classic-cover.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/produkty/iglo5/film_hd/iglo_5_animacja_-_angielska_-_03-06-2020_web.mp4',
  equipmentVideoLink: {
    afterItemMatch: '5-chamber PVC under-sill trim with gasket',
    label: 'See Video',
    url: 'https://www.drutex.eu/media/_upload/produkty/iglo5/film_hd/iglo_5_animacja_-_angielska_-_03-06-2020_web.mp4'
  },
  standardEquipment: [
    "MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anticorrosion coating for long-lasting protection and smooth operation of the fitting",
    "Sash lifter (lifting mishandling device - depending on window height)",
    "Microventilation in tilt and turn windows",
    "Hinge covers in 4 colours: white, silver, light brown, brown",
    "Aluminium handle",
    "2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)",
    "Galvanised steel glass-pane spacer optional Swisspacer Ultimate glass-pane spacer",
    "2 EPDM gaskets in black (external and internal)",
    "Gasket filling the lower fittings groove",
    "1.5 mm steel reinforcement for frame and sash (2 mm for balcony door sash), 'c'-shaped",
    "Profile core in white",
    "5-chamber PVC under-sill trim with gasket"
  ],
  keySpecs: [
    { label: 'sound', value: '34-42 dB' },
    { label: 'gaskets', value: '2' },
    { label: 'thermal', value: 'Uw = 0.89 W/(m²K)*' },
    { label: 'chambers', value: '5' },
    { label: 'depth', value: '70 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_LIGHT_DETAIL: ProductDetailData = {
  id: 'p7',
  slug: 'iglo-light',
  name: 'IGLO LIGHT',
  tagline: 'Even more daylight into your space',
  description: 'This 5-chamber and original system stands out for its high aesthetic values and thin frame and sash profiles. In comparison with traditional systems, it features a 32% narrower movable mullion, which translates into more natural light entering the room.',
  heroImage: '/assets/iglo-light/iglo_light_-_pr.png',
  windowPhoto: '/assets/iglo-light/iglo_light_-_pr.png',
  profileImage: '/assets/iglo-light/iglo_light_-_pr.png',
  blueprintImage: '/assets/iglo-light/iglo_light.png',
  videoSrc: 'https://www.drutex.eu/media/_upload/header_video/iglo_light_okna.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/produkty/iglo_light/video/iglo_light.mp4',
  equipmentVideoLink: {
    afterItemMatch: '5-chamber PVC under-sill trim with gasket',
    label: 'See Video',
    url: 'https://www.drutex.eu/media/_upload/produkty/iglo_light/video/iglo_light.mp4'
  },
  standardEquipment: [
    "MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anti-corrosion coating for long-lasting protection and smooth operation of the fitting",
    "Sash lifter (lifting mishandling device - depending on window height)",
    "Microventilation in tilt and turn windows",
    "Hinge covers in 4 colours: white, silver, light brown, brown",
    "Aluminium handle",
    "2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "Glass-pane spacer made of galvanised steel",
    "2 EPDM gaskets in black (external and internal)",
    "Gasket filling the lower fittings groove",
    "1.5 mm steel reinforcement for frame and sash (2mm for balcony door sash), „c”-shaped",
    "Profile core in white",
    "5-chamber PVC under-sill trim with gasket",
    "V-Perfect welding"
  ],
  keySpecs: [
    { label: 'sound', value: '34 dB' },
    { label: 'gaskets', value: '2' },
    { label: 'thermal', value: 'Uw = 0.88 W/(m²K)*' },
    { label: 'chambers', value: '5' },
    { label: 'depth', value: '70 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_EXT_DETAIL: ProductDetailData = {
  id: 'p8',
  slug: 'iglo-ext',
  name: 'IGLO EXT',
  tagline: 'Modern PVC balcony windows and doors that open outwards',
  description: 'Balcony windows and doors that open outwards stand out for their modern design and excellent thermal insulation performance. As standard, these windows have hidden fittings (invisible when closed), while balcony doors have door (surface) fittings. The Iglo EXT window and door system is ideal for those looking for modern design and high aesthetic values.',
  heroImage: '/assets/iglo-ext/iglo_ext_-_pr.png',
  windowPhoto: '/assets/iglo-ext/iglo_ext_-_pr.png',
  profileImage: '/assets/iglo-ext/iglo_ext_-_pr.png',
  blueprintImage: '/assets/iglo-ext/iglo_ext.png',
  videoSrc: 'https://www.drutex.eu/media/_upload/produkty/okno-iglo-ext/okno-iglo-ext-2023.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/produkty/okno-iglo-ext/iglo-ext.mp4',
  equipmentVideoLink: {
    afterItemMatch: '5-chamber PVC under-sill trim with gasket',
    label: 'See Video',
    url: 'https://www.drutex.eu/media/_upload/produkty/okno-iglo-ext/iglo-ext.mp4'
  },
  standardEquipment: [
    "Double-chamber glazing package Ug=1,1W/(m2K)",
    "Concealed MACO Multi-Power fittings in the window (invisible hinges when the window is closed), door fittings on balcony windows or balcony doors",
    "Double roller DM20 bolt for full (airtight) locking or locking with trickle ventilation",
    "Aluminium handle with double-sided insert",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "2 EPDM gaskets in black (external and internal)",
    "Gasket filling the lower fittings groove",
    "1.5 mm full (closed), steel, „c”-shaped frame and sash reinforcement (2 mm for balcony door sashes)",
    "Profile core in white",
    "5-chamber PVC under-sill trim with gasket"
  ],
  keySpecs: [
    { label: 'sound', value: '34 - 35dB*' },
    { label: 'gaskets', value: '2' },
    { label: 'thermal', value: 'Uw = 0.89 W/(m2K)*' },
    { label: 'chambers', value: '5' },
    { label: 'depth', value: '70 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IGLO_PREMIER_DETAIL: ProductDetailData = {
  id: 'p9',
  slug: 'iglo-premier',
  name: 'IGLO PREMIER',
  tagline: 'Modern outward-opening casement or tilt windows',
  description: 'Original outward opening casement or tilt windows are based on an extremely warm 5-chamber A-class profile made exclusively of primary material. The system comes with double sealing and reliable fittings to ensure high utility values for years to come.',
  heroImage: '/assets/iglo-premier/iglo_premier_-_pr.png',
  windowPhoto: '/assets/iglo-premier/iglo_premier_-_pr.png',
  profileImage: '/assets/iglo-premier/iglo_premier_-_pr.png',
  blueprintImage: '/assets/iglo-premier/iglo_premier.png',
  videoSrc: 'https://www.drutex.eu/media/_upload/produkty/iglo_premiere/iglo-premiere-drutex.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/iglo_premiere-2-options.mp4',
  equipmentVideoLink: {
    afterItemMatch: '5-chamber PVC under-sill trim with gasket',
    label: 'See Video',
    url: 'https://www.drutex.eu/media/_upload/iglo_premiere-2-options.mp4'
  },
  standardEquipment: [
    "Scissor hinges (invisible when the window is closed), double roller DM20 bolt for full (airtight) locking or locking with trickle ventilation",
    "Double-chamber glazing package Ug=1,1W/(m2K)",
    "Aluminium handle",
    "2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "2 EPDM gaskets in black (external and internal)",
    "Gasket filling the lower fittings groove",
    "1.5 mm full (closed), steel, „c”-shaped frame and sash reinforcement (2 mm for balcony door sashes)",
    "Profile core in white",
    "5-chamber PVC under-sill trim with gasket"
  ],
  keySpecs: [
    { label: 'sound', value: '34 - 35dB*' },
    { label: 'gaskets', value: '2' },
    { label: 'thermal', value: 'Uw = 0.89 W/(m2K)*' },
    { label: 'chambers', value: '5' },
    { label: 'depth', value: '70 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IDEAL_NEO_AD_DETAIL: ProductDetailData = {
  id: 'p10',
  slug: 'ideal-neo-ad',
  name: 'IDEAL NEO AD',
  tagline: 'Innovative PVC windows with angular design',
  description: 'Slim and symmetrical profiles refer to current design trends and give lightness and elegance to the windows. Extremely narrow profile combinations mean even more light in the rooms. An attractive solution for both new built and renovation.',
  heroImage: '/assets/ideal-neo-ad/ideal_neo_ad_profil.png',
  windowPhoto: '/assets/ideal-neo-ad/ideal_neo_ad_profil.png',
  profileImage: '/assets/ideal-neo-ad/ideal_neo_ad_profil.png',
  blueprintImage: '/assets/ideal-neo-ad/ideal_neo_ad.png',
  videoSrc: 'https://www.drutex.eu/media/_upload/produkty/ideal_neo_ad/video/ideal-neo-piryt-header.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/produkty/ideal_neo_ad/video/ideal-neo-piryt-produkt.mp4',
  inlineVideoSrc: '/assets/ideal-neo-ad/ideal-neo-piryt-produkt.mp4',
  equipmentVideoLink: {
    afterItemMatch: 'filling of the lower hardware groove',
    label: 'See Video',
    url: 'https://www.drutex.eu/media/_upload/produkty/ideal_neo_ad/video/ideal-neo-piryt-produkt.mp4'
  },
  standardEquipment: [
    "Double-chamber glazing package Ug = 0,5 W/(m2K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and gaskets in black or grey",
    "Filling of the lower hardware groove"
  ],
  keySpecs: [
    { label: 'sound', value: '36dB' },
    { label: 'gaskets', value: '2' },
    { label: 'thermal', value: 'Uw = 0.79 W/(m2K)*' },
    { label: 'chambers', value: '5' },
    { label: 'depth', value: '76 mm' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IDEAL_NEO_MD_DETAIL: ProductDetailData = {
  id: 'p11',
  slug: 'ideal-neo-md',
  name: 'IDEAL NEO MD',
  tagline: 'Modern 6-chamber window with MD sealing system',
  description: 'Slim and symmetrical profiles refer to current design trends and give lightness and elegance to the windows. Extremely narrow profile combinations mean even more light in the rooms. An attractive solution for both new built and renovation.',
  heroImage: '/assets/ideal-neo-md/ideal_neo_md_profil.png',
  windowPhoto: '/assets/ideal-neo-md/ideal_neo_md_profil.png',
  profileImage: '/assets/ideal-neo-md/ideal_neo_md_profil.png',
  blueprintImage: '/assets/ideal-neo-md/ideal_neo_md.png',
  videoSrc: 'https://www.drutex.eu/media/_upload/produkty/neo-md/wideo/okno-neomd-standard.mp4',
  modalVideoSrc: 'https://www.drutex.eu/media/_upload/produkty/neo-md/wideo/neo-md-okno-produkt.mp4',
  inlineVideoSrc: '/assets/ideal-neo-md/neo-md-okno-produkt.mp4',
  equipmentVideoLink: {
    afterItemMatch: 'filling of the lower hardware groove',
    label: 'See Video',
    url: 'https://www.drutex.eu/media/_upload/produkty/neo-md/wideo/neo-md-okno-produkt.mp4'
  },
  standardEquipment: [
    "Double-chamber glazing package Ug = 0,5 W/(m2K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove"
  ],
  keySpecs: [
    { label: 'sound', value: '36dB' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.76 W/(m2K)*' },
    { label: 'chambers', value: '6' },
    { label: 'depth', value: '76 mm' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IDEAL_NEO_MD_FS_DETAIL: ProductDetailData = {
  id: 'p12',
  slug: 'ideal-neo-md-fs',
  name: 'IDEAL NEO MD-FS',
  tagline: 'In harmony with the architecture',
  description: 'is an extremely attractive design proposition for customers who value timeless style. A simple, symmetrical, cubist shape is the distinguishing feature of the system. Sharpes angles and geometric architecture, and at the same time visual lightness of the structure.',
  heroImage: '/assets/ideal-neo-md-fs/NEO_MD_FS_HERO.webp',
  inlineImageSrc: '/assets/ideal-neo-md-fs/ideal_neo_md-fs-_ok.png',
  windowPhoto: '/assets/ideal-neo-md-fs/ideal_neo_md_fs_profil.png',
  profileImage: '/assets/ideal-neo-md-fs/naroznik_1.png',
  blueprintImage: '/assets/ideal-neo-md-fs/idel_neo_md-fs_okok.jpg',
  standardEquipment: [
    "Double-chamber glazing package Ug = 0,5 W/(m2K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove"
  ],
  keySpecs: [
    { label: 'sound', value: '36dB' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.73 W/(m2K)*' },
    { label: 'chambers', value: '6' },
    { label: 'depth', value: '76 mm' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IDEAL_NEO_MD_MONOBLOCK_DETAIL: ProductDetailData = {
  id: 'p13',
  slug: 'ideal-neo-md-monoblock',
  name: 'IDEAL NEO MD MONOBLOCK',
  tagline: 'Monoblock frames for insulation layer',
  description: 'Monoblock frames are designed for the construction of windows, which are installed in a layer of insulation. The wide range of Monoblock frames (76 mm, 122 mm, 142 mm, 162 mm) allows their appropriate selection depending on the thickness of the insulation. A special shelf (window sill) located from the outer side of the frame in an aesthetic manner masks the insulation around the perimeter of the window avoiding the formation of thermal bridges. The inner rebate of the Monoblock frame ensures aesthetic installation from the inside of the room without the need of gypsum treatment.',
  heroImage: '/assets/ideal-neo-md-monoblock/NEO_MD_MONOBLOCK_HERO.webp',
  inlineImageSrc: '/assets/ideal-neo-md-monoblock/ideal-ne-md-monoblock.jpg',
  windowPhoto: '/assets/ideal-neo-md-monoblock/ideal_neo_md_monoblock_profil.jpg',
  profileImage: '/assets/ideal-neo-md-monoblock/ideal_neo_md_monoblock_profil.jpg',
  blueprintImage: '/assets/ideal-neo-md-monoblock/ideal_neo_md_monoblock.png',
  profileVariants: [
    { name: '76 mm', image: '/assets/ideal-neo-md-monoblock/mb-76.png' },
    { name: '122 mm', image: '/assets/ideal-neo-md-monoblock/mb-122.png' },
    { name: '142 mm', image: '/assets/ideal-neo-md-monoblock/mb-142.png' },
    { name: '162 mm', image: '/assets/ideal-neo-md-monoblock/mb-162.png' }
  ],
  keySpecs: [
    { label: 'sound', value: '36dB' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.76 W/(m2K)*' },
    { label: 'chambers', value: '6' },
    { label: 'depth', value: '76-162 mm' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

export const IDEAL_NEO_MD_RENOVATION_DETAIL: ProductDetailData = {
  id: 'ideal-neo-md-renovation',
  slug: 'ideal-neo-md-renovation',
  name: 'IDEAL NEO MD RENOVATION',
  tagline: 'Renovation frame system',
  description: 'The renovation frame system is used for window installation without the need to dismantle old frames. The specificity of this type of windows is based on the use of special renovation frames with a so-called masking profile, which encompasses the wooden frame, creating a characteristic band from the inside, and on the outside we can use special housing profiles. The masking profiles in the framework have different widths (40 mm, 70 mm), but it is also possible to cut them for specific needs.',
  heroImage: '/assets/ideal-neo-md-renovation/ideal_neo_md_renovation_tlo.webp',
  inlineImageSrc: '/assets/ideal-neo-md-renovation/ideal_neo_md_renovation_profil.jpg',
  windowPhoto: '/assets/ideal-neo-md-renovation/ideal_neo_md_renovation_profil.jpg',
  profileImage: '/assets/ideal-neo-md-renovation/ideal_neo_md_renovation_profil.jpg',
  blueprintImage: '/assets/ideal-neo-md-renovation/ideal_neo_md_renovation_profil.jpg',
  profileVariants: [
    { name: '40 mm (A)', image: '/assets/ideal-neo-md-renovation/r-40.png' },
    { name: '40 mm (B)', image: '/assets/ideal-neo-md-renovation/renowacja_40_b.png' },
    { name: '70 mm', image: '/assets/ideal-neo-md-renovation/r-70.png' }
  ],
  keySpecs: [
    { label: 'sound', value: '36dB' },
    { label: 'gaskets', value: '3' },
    { label: 'chambers', value: '5' }
  ],
  standardEquipment: [
    "Double-chamber glazing package Ug = 0,5 W/(m2K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "Aluminum handle",
    "Maco Multi Matic KS hardware"
  ],
  colors: IGLO_EDGE_COLORS,
  glassOptions: [],
  hardware: [],
  accessories: [],
  videoSrc: ''
};

export const IDEAL_7000_NL_DETAIL: ProductDetailData = {
  id: 'ideal-7000-nl',
  slug: 'ideal-7000-nl',
  name: 'IDEAL 7000 NL',
  tagline: 'Classic meets innovation',
  description: 'The Ideal 7000 NL system is dedicated specifically for the Dutch market. It perfectly fits into the classic style while meeting all modern energy efficiency and safety standards.',
  heroImage: '/assets/ideal-7000-nl/ideal-7000-header.webp',
  windowPhoto: '/assets/ideal-7000-nl/ideal_7000_nl_-_1.png',
  profileImage: '/assets/ideal-7000-nl/ideal_7000_nl-profil_a.png',
  blueprintImage: '/assets/ideal-7000-nl/ideal_7000_nl-profil_b.png',
  videoSrc: '',
  inlineVideoSrc: '/assets/ideal-7000-nl/ideal-7000-nl-inline.mp4',
  profileVariants: [
    { name: 'Profile A', image: '/assets/ideal-7000-nl/ideal_7000_nl-profil_a.png' },
    { name: 'Profile A Detail', image: '/assets/ideal-7000-nl/ideal_7000_nl_-_1.png' },
    { name: 'Profile B', image: '/assets/ideal-7000-nl/ideal_7000_nl-profil_b.png' },
    { name: 'Profile B Detail', image: '/assets/ideal-7000-nl/ideal_7000_nl_-_2.png' }
  ],
  weldingSection: {
    videos: [
      '/assets/ideal-7000-nl/zgrzew-v-perfect.mp4',
      '/assets/ideal-7000-nl/zgrzew-hfl.mp4'
    ],
    description: 'HFL Welding (Holz Fenster Look) is a modern method of joining the frame and sash in windows and doors within the Ideal 7000NL system, applied from the exterior side. Thanks to 90° joints instead of standard 45° welds, the structure gains an appearance similar to wooden windows. At the same time, all advantages of PVC windows are preserved.'
  },
  keySpecs: [
    { label: 'sound', value: '34dB' },
    { label: 'gaskets', value: '2' },
    { label: 'chambers', value: '6' }
  ],
  standardEquipment: [
    "Double-chamber glazing package Ug = 0,5 W/(m2K)",
    "Aluminum handle",
    "Maco Multi Matic KS hardware"
  ],
  colors: IGLO_EDGE_COLORS,
  glassOptions: [],
  hardware: [],
  accessories: []
};

export const FULL_RAL_COLORS: SwatchColor[] = [
  { id: 'ral-green-beige', name: 'Green beige', hex: 'rgb(190, 189, 127)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-beige', name: 'Beige', hex: 'rgb(194, 176, 120)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-sand-yellow', name: 'Sand yellow', hex: 'rgb(198, 166, 100)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-yellow', name: 'Signal yellow', hex: 'rgb(229, 190, 1)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-golden-yellow', name: 'Golden yellow', hex: 'rgb(205, 164, 52)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-honey-yellow', name: 'Honey yellow', hex: 'rgb(169, 131, 7)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-maize-yellow', name: 'Maize yellow', hex: 'rgb(228, 160, 16)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-daffodil-yellow', name: 'Daffodil yellow', hex: 'rgb(220, 157, 0)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-brown-beige', name: 'Brown beige', hex: 'rgb(138, 102, 66)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-lemon-yellow', name: 'Lemon yellow', hex: 'rgb(199, 180, 70)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-oyster-white', name: 'Oyster white', hex: 'rgb(234, 230, 202)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-ivory', name: 'Ivory', hex: 'rgb(240, 214, 171)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-light-ivory', name: 'Light ivory', hex: 'rgb(230, 214, 144)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-sulfur-yellow', name: 'Sulfur yellow', hex: 'rgb(237, 255, 33)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-saffron-yellow', name: 'Saffron yellow', hex: 'rgb(245, 208, 51)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-zinc-yellow', name: 'Zinc yellow', hex: 'rgb(255, 214, 77)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grey-beige', name: 'Grey beige', hex: 'rgb(158, 151, 100)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-olive-yellow', name: 'Olive yellow', hex: 'rgb(153, 153, 80)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-rape-yellow', name: 'Rape yellow', hex: 'rgb(243, 218, 11)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-yellow', name: 'Traffic yellow', hex: 'rgb(250, 210, 1)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-ochre-yellow', name: 'Ochre yellow', hex: 'rgb(174, 160, 75)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-luminous-yellow', name: 'Luminous yellow', hex: 'rgb(255, 255, 0)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-curry', name: 'Curry', hex: 'rgb(157, 145, 1)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-melon-yellow', name: 'Melon yellow', hex: 'rgb(244, 169, 0)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-broom-yellow', name: 'Broom yellow', hex: 'rgb(214, 174, 1)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-dahlia-yellow', name: 'Dahlia yellow', hex: 'rgb(243, 165, 5)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pastel-yellow', name: 'Pastel yellow', hex: 'rgb(239, 169, 74)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-beige', name: 'Pearl beige', hex: 'rgb(106, 93, 77)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-gold', name: 'Pearl gold', hex: 'rgb(112, 83, 53)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-sun-yellow', name: 'Sun yellow', hex: 'rgb(243, 159, 24)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-yellow-orange', name: 'Yellow orange', hex: 'rgb(237, 118, 14)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-red-orange', name: 'Red orange', hex: 'rgb(201, 60, 32)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-vermilion', name: 'Vermilion', hex: 'rgb(203, 40, 33)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pastel-orange', name: 'Pastel orange', hex: 'rgb(255, 117, 20)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pure-orange', name: 'Pure orange', hex: 'rgb(244, 70, 17)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-luminous-orange', name: 'Luminous orange', hex: 'rgb(255, 35, 1)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-luminous-bright-orange', name: 'Luminous bright orange', hex: 'rgb(255, 164, 32)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-bright-red-orange', name: 'Bright red orange', hex: 'rgb(247, 94, 37)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-orange', name: 'Traffic orange', hex: 'rgb(245, 64, 33)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-orange', name: 'Signal orange', hex: 'rgb(216, 75, 32)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-deep-orange', name: 'Deep orange', hex: 'rgb(236, 124, 38)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-salmon-range', name: 'Salmon range', hex: 'rgb(229, 81, 55)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-orange', name: 'Pearl orange', hex: 'rgb(195, 88, 49)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-flame-red', name: 'Flame red', hex: 'rgb(175, 43, 30)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-red', name: 'Signal red', hex: 'rgb(165, 32, 25)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-carmine-red', name: 'Carmine red', hex: 'rgb(162, 35, 29)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-ruby-red', name: 'Ruby red', hex: 'rgb(155, 17, 30)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-purple-red', name: 'Purple red', hex: 'rgb(117, 21, 30)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-wine-red', name: 'Wine red', hex: 'rgb(94, 33, 41)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-black-red', name: 'Black red', hex: 'rgb(65, 34, 39)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-oxide-red', name: 'Oxide red', hex: 'rgb(100, 36, 36)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-brown-red', name: 'Brown red', hex: 'rgb(120, 31, 25)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-beige-red', name: 'Beige red', hex: 'rgb(193, 135, 107)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-tomato-red', name: 'Tomato red', hex: 'rgb(161, 35, 18)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-antique-pink', name: 'Antique pink', hex: 'rgb(211, 110, 112)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-light-pink', name: 'Light pink', hex: 'rgb(234, 137, 154)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-coral-red', name: 'Coral red', hex: 'rgb(179, 40, 33)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-rose', name: 'Rose', hex: 'rgb(230, 50, 68)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-strawberry-red', name: 'Strawberry red', hex: 'rgb(213, 48, 50)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-red', name: 'Traffic red', hex: 'rgb(204, 6, 5)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-salmon-pink', name: 'Salmon pink', hex: 'rgb(217, 89, 79)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-luminous-red', name: 'Luminous red', hex: 'rgb(248, 0, 0)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-luminous-bright-red', name: 'Luminous bright red', hex: 'rgb(254, 0, 0)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-raspberry-red', name: 'Raspberry red', hex: 'rgb(197, 29, 52)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pure-red', name: 'Pure  red', hex: 'rgb(203, 50, 52)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-orient-red', name: 'Orient red', hex: 'rgb(179, 36, 40)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-ruby-red', name: 'Pearl ruby red', hex: 'rgb(114, 20, 34)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-pink', name: 'Pearl pink', hex: 'rgb(180, 76, 67)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-red-lilac', name: 'Red lilac', hex: 'rgb(109, 63, 91)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-red-violet', name: 'Red violet', hex: 'rgb(146, 43, 62)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-heather-violet', name: 'Heather violet', hex: 'rgb(222, 76, 138)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-claret-violet', name: 'Claret violet', hex: 'rgb(100, 28, 52)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-blue-lilac', name: 'Blue lilac', hex: 'rgb(108, 70, 117)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-purple', name: 'Traffic purple', hex: 'rgb(160, 52, 114)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-purple-violet', name: 'Purple violet', hex: 'rgb(74, 25, 44)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-violet', name: 'Signal violet', hex: 'rgb(146, 78, 125)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pastel-violet', name: 'Pastel violet', hex: 'rgb(161, 133, 148)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-telemagenta', name: 'Telemagenta', hex: 'rgb(207, 52, 118)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-violet', name: 'Pearl violet', hex: 'rgb(134, 115, 161)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-black-berry', name: 'Pearl black berry', hex: 'rgb(108, 104, 116)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-violet-blue', name: 'Violet blue', hex: 'rgb(53, 77, 115)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-green-blue', name: 'Green blue', hex: 'rgb(31, 52, 56)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-ultramarine-blue', name: 'Ultramarine blue', hex: 'rgb(32, 33, 79)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-saphire-blue', name: 'Saphire blue', hex: 'rgb(29, 30, 51)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-black-blue', name: 'Black blue', hex: 'rgb(24, 23, 28)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-blue', name: 'Signal blue', hex: 'rgb(30, 36, 96)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-brillant-blue', name: 'Brillant blue', hex: 'rgb(62, 95, 138)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grey-blue', name: 'Grey blue', hex: 'rgb(38, 37, 45)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-azure-blue', name: 'Azure blue', hex: 'rgb(2, 86, 105)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-gentian-blue', name: 'Gentian blue', hex: 'rgb(14, 41, 75)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-steel-blue', name: 'Steel blue', hex: 'rgb(35, 26, 36)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-light-blue', name: 'Light blue', hex: 'rgb(59, 131, 189)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-cobalt-blue', name: 'Cobalt blue', hex: 'rgb(30, 33, 61)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pigeon-blue', name: 'Pigeon blue', hex: 'rgb(96, 110, 140)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-sky-blue', name: 'Sky blue', hex: 'rgb(34, 113, 179)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-blue', name: 'Traffic blue', hex: 'rgb(6, 57, 113)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-turquoise-blue', name: 'Turquoise blue', hex: 'rgb(63, 136, 143)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-capri-blue', name: 'Capri blue', hex: 'rgb(27, 85, 131)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-ocean-blue', name: 'Ocean blue', hex: 'rgb(5, 51, 51)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-water-blue', name: 'Water blue', hex: 'rgb(37, 109, 123)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-night-blue', name: 'Night blue', hex: 'rgb(37, 40, 80)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-distant-blue', name: 'Distant blue', hex: 'rgb(73, 103, 141)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pastel-blue', name: 'Pastel blue', hex: 'rgb(87, 140, 181)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-gentian-blue', name: 'Pearl gentian blue', hex: 'rgb(42, 100, 120)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-night-blue', name: 'Pearl night blue', hex: 'rgb(16, 44, 84)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-patina-green', name: 'Patina green', hex: 'rgb(49, 102, 80)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-emerald-green', name: 'Emerald green', hex: 'rgb(40, 114, 51)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-leaf-green', name: 'Leaf green', hex: 'rgb(45, 87, 44)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-olive-green', name: 'Olive green', hex: 'rgb(66, 70, 50)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-blue-green', name: 'Blue green', hex: 'rgb(31, 58, 61)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-moss-green', name: 'Moss green', hex: 'rgb(47, 69, 56)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grey-olive', name: 'Grey olive', hex: 'rgb(62, 59, 50)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-bottle-green', name: 'Bottle green', hex: 'rgb(52, 59, 41)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-brown-green', name: 'Brown green', hex: 'rgb(57, 53, 42)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-fir-green', name: 'Fir green', hex: 'rgb(49, 55, 43)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grass-green', name: 'Grass green', hex: 'rgb(53, 104, 45)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-reseda-green', name: 'Reseda green', hex: 'rgb(88, 114, 70)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-black-green', name: 'Black green', hex: 'rgb(52, 62, 64)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-reed-green', name: 'Reed green', hex: 'rgb(108, 113, 86)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-yellow-olive', name: 'Yellow olive', hex: 'rgb(71, 64, 46)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-black-olive', name: 'Black olive', hex: 'rgb(59, 60, 54)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-turquoise-green', name: 'Turquoise green', hex: 'rgb(30, 89, 69)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-may-green', name: 'May green', hex: 'rgb(76, 145, 65)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-yellow-green', name: 'Yellow green', hex: 'rgb(87, 166, 57)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pastel-green', name: 'Pastel green', hex: 'rgb(189, 236, 182)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-chrome-green', name: 'Chrome green', hex: 'rgb(46, 58, 35)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pale-green', name: 'Pale green', hex: 'rgb(137, 172, 118)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-olive-drab', name: 'Olive drab', hex: 'rgb(37, 34, 27)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-green', name: 'Traffic green', hex: 'rgb(48, 132, 70)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-fern-green', name: 'Fern green', hex: 'rgb(61, 100, 45)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-opal-green', name: 'Opal green', hex: 'rgb(1, 93, 82)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-light-green', name: 'Light green', hex: 'rgb(132, 195, 190)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pine-green', name: 'Pine green', hex: 'rgb(44, 85, 69)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-mint-green', name: 'Mint green', hex: 'rgb(32, 96, 61)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-green', name: 'Signal green', hex: 'rgb(49, 127, 67)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-mint-turquoise', name: 'Mint turquoise', hex: 'rgb(73, 126, 118)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pastel-turquoise', name: 'Pastel turquoise', hex: 'rgb(127, 181, 181)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-green', name: 'Pearl green', hex: 'rgb(28, 84, 45)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-opal-green', name: 'Pearl opal green', hex: 'rgb(25, 55, 55)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pure-green', name: 'Pure green', hex: 'rgb(0, 143, 57)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-luminous-green', name: 'Luminous green', hex: 'rgb(0, 187, 45)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-squirrel-grey', name: 'Squirrel grey', hex: 'rgb(120, 133, 139)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-silver-grey', name: 'Silver grey', hex: 'rgb(138, 149, 151)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-olive-grey', name: 'Olive grey', hex: 'rgb(126, 123, 82)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-moss-grey', name: 'Moss grey', hex: 'rgb(108, 112, 89)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-grey', name: 'Signal grey', hex: 'rgb(150, 153, 146)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-mouse-grey', name: 'Mouse grey', hex: 'rgb(100, 107, 99)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-beige-grey', name: 'Beige grey', hex: 'rgb(109, 101, 82)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-khaki-grey', name: 'Khaki grey', hex: 'rgb(106, 95, 49)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-green-grey', name: 'Green grey', hex: 'rgb(77, 86, 69)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-tarpaulin-grey', name: 'Tarpaulin grey', hex: 'rgb(76, 81, 74)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-iron-grey', name: 'Iron grey', hex: 'rgb(67, 75, 77)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-basalt-grey', name: 'Basalt grey', hex: 'rgb(78, 87, 84)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-brown-grey', name: 'Brown grey', hex: 'rgb(70, 69, 49)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-slate-grey', name: 'Slate grey', hex: 'rgb(67, 71, 80)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-anthracite-grey', name: 'Anthracite grey', hex: 'rgb(41, 49, 51)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-black-grey', name: 'Black grey', hex: 'rgb(35, 40, 43)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-umbra-grey', name: 'Umbra grey', hex: 'rgb(51, 47, 44)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-concrete-grey', name: 'Concrete grey', hex: 'rgb(104, 108, 94)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-graphite-grey', name: 'Graphite grey', hex: 'rgb(71, 74, 81)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-granite-grey', name: 'Granite grey', hex: 'rgb(47, 53, 59)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-stone-grey', name: 'Stone grey', hex: 'rgb(139, 140, 122)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-blue-grey', name: 'Blue grey', hex: 'rgb(71, 75, 78)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pebble-grey', name: 'Pebble grey', hex: 'rgb(184, 183, 153)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-cement-grey', name: 'Cement grey', hex: 'rgb(125, 132, 113)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-yellow-grey', name: 'Yellow grey', hex: 'rgb(143, 139, 102)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-light-grey', name: 'Light grey', hex: 'rgb(215, 215, 215)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-platinum-grey', name: 'Platinum grey', hex: 'rgb(127, 118, 121)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-dusty-grey', name: 'Dusty grey', hex: 'rgb(125, 127, 125)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-agate-grey', name: 'Agate grey', hex: 'rgb(181, 184, 177)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-quartz-grey', name: 'Quartz grey', hex: 'rgb(108, 105, 96)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-window-grey', name: 'Window grey', hex: 'rgb(157, 161, 170)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-grey-a', name: 'Traffic grey A', hex: 'rgb(141, 148, 141)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-grey-b', name: 'Traffic grey B', hex: 'rgb(78, 84, 82)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-silk-grey', name: 'Silk grey', hex: 'rgb(202, 196, 176)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-telegrey-1', name: 'Telegrey 1', hex: 'rgb(144, 144, 144)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-telegrey-2', name: 'Telegrey 2', hex: 'rgb(130, 137, 143)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-telegrey-4', name: 'Telegrey 4', hex: 'rgb(208, 208, 208)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-mouse-grey', name: 'Pearl mouse grey', hex: 'rgb(137, 129, 118)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-green-brown', name: 'Green brown', hex: 'rgb(130, 108, 52)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-ochre-brown', name: 'Ochre brown', hex: 'rgb(149, 95, 32)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-brown', name: 'Signal brown', hex: 'rgb(108, 59, 42)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-clay-brown', name: 'Clay brown', hex: 'rgb(115, 66, 34)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-copper-brown', name: 'Copper brown', hex: 'rgb(142, 64, 42)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-fawn-brown', name: 'Fawn brown', hex: 'rgb(89, 53, 31)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-olive-brown', name: 'Olive brown', hex: 'rgb(111, 79, 40)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-nut-brown', name: 'Nut brown', hex: 'rgb(91, 58, 41)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-red-brown', name: 'Red brown', hex: 'rgb(89, 35, 33)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-sepia-brown', name: 'Sepia brown', hex: 'rgb(56, 44, 30)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-chestnut-brown', name: 'Chestnut brown', hex: 'rgb(99, 58, 52)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-mahogany-brown', name: 'Mahogany brown', hex: 'rgb(76, 47, 39)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-chocolate-brown', name: 'Chocolate brown', hex: 'rgb(69, 50, 46)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grey-brown', name: 'Grey brown', hex: 'rgb(64, 58, 58)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-black-brown', name: 'Black brown', hex: 'rgb(33, 33, 33)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-orange-brown', name: 'Orange brown', hex: 'rgb(166, 94, 46)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-beige-brown', name: 'Beige brown', hex: 'rgb(121, 85, 61)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pale-brown', name: 'Pale brown', hex: 'rgb(117, 92, 72)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-terra-brown', name: 'Terra brown', hex: 'rgb(78, 59, 49)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-copper', name: 'Pearl copper', hex: 'rgb(118, 60, 40)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-cream', name: 'Cream', hex: 'rgb(253, 244, 227)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grey-white', name: 'Grey white', hex: 'rgb(231, 235, 218)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-white', name: 'Signal white', hex: 'rgb(244, 244, 244)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-signal-black', name: 'Signal black', hex: 'rgb(40, 40, 40)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-jet-black', name: 'Jet black', hex: 'rgb(10, 10, 10)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-white-aluminium', name: 'White aluminium', hex: 'rgb(165, 165, 165)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-grey-aluminium', name: 'Grey aluminium', hex: 'rgb(143, 143, 143)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pure-white', name: 'Pure white', hex: 'rgb(255, 255, 255)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-graphite-black', name: 'Graphite black', hex: 'rgb(28, 28, 28)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-white', name: 'Traffic white', hex: 'rgb(246, 246, 246)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-traffic-black', name: 'Traffic black', hex: 'rgb(30, 30, 30)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-papyrus-white', name: 'Papyrus white', hex: 'rgb(215, 215, 215)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-light-grey', name: 'Pearl light grey', hex: 'rgb(156, 156, 156)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-pearl-dark-grey', name: 'Pearl dark grey', hex: 'rgb(130, 130, 130)', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' }
];

export const MB_86N_SI_DETAIL: ProductDetailData = {
  id: 'mb-86n-si',
  slug: 'mb-86n-si',
  name: 'MB-86N SI',
  tagline: 'Aluminium windows',
  description: 'The MB-86N SI window system is a modern aluminium solution designed to offer high thermal and acoustic insulation parameters. It is an excellent choice for energy-efficient buildings.',
  heroImage: '/assets/mb-86n-si/hero-bg.webp',
  windowPhoto: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  profileImage: '/assets/mb-86n-si/profile.png',
  blueprintImage: '/assets/mb-86n-si/blueprint.png',
  videoSrc: '/assets/mb-86n-si/hero-video.mp4',
  inlineVideoSrc: '/assets/mb-86n-si/okno-mb86si.mp4',
  keySpecs: [
    { label: 'thermal', value: '0.76 W/(m²K)' },
    { label: 'chambers', value: '3' },
    { label: 'depth', value: '77mm' }
  ],
  standardEquipment: [
    "High thermal insulation profile",
    "Modern aluminium frame",
    "Triple glazing options"
  ],
  colors: FULL_RAL_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 ("safety") matt film',     image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: '44.4 anti-burglary',            image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g4',  name: 'Antisol Dark Blue 6',       image: '/assets/glass/thumbs/antisol-blue-6.webp',      largeImage: '/assets/glass/large/antisol-blue-6.jpg' },
    { id: 'g5',  name: 'Antisol grey 6',            image: '/assets/glass/thumbs/antisol-grey-6.webp',      largeImage: '/assets/glass/large/antisol-grey-6.jpg' },
    { id: 'g6',  name: 'Antisol brown 4',          image: '/assets/glass/thumbs/antisol-brown-4.webp',     largeImage: '/assets/glass/large/antisol-brown-4.jpg' },
    { id: 'g7',  name: 'Antisol brown 6',          image: '/assets/glass/thumbs/antisol-brown-6.webp',     largeImage: '/assets/glass/large/antisol-brown-6.jpg' },
    { id: 'g8',  name: 'Antisol green 4',           image: '/assets/glass/thumbs/antisol-green-4.webp',     largeImage: '/assets/glass/large/antisol-green-4.jpg' },
    { id: 'g9',  name: 'Antisol green 6',           image: '/assets/glass/thumbs/antisol-green-6.webp',     largeImage: '/assets/glass/large/antisol-green-6.jpg' },
    { id: 'g10', name: 'Chinchilla white 4',       image: '/assets/glass/thumbs/chinchilla-4.webp',        largeImage: '/assets/glass/large/chinchilla-4.jpg' },
    { id: 'g11', name: 'Float 4',                   image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' },
    { id: 'g12', name: 'Float 6',                   image: '/assets/glass/thumbs/float-6.webp',             largeImage: '/assets/glass/large/float-6.jpg' },
    { id: 'g13', name: 'Mirastar',                  image: '/assets/glass/thumbs/mirastar.webp',            largeImage: '/assets/glass/large/mirastar.jpg' },
    { id: 'g14', name: 'Ornament Cathedral',       image: '/assets/glass/thumbs/ornamento-cathedral.webp', largeImage: '/assets/glass/large/ornamento-cathedral.jpg' },
    { id: 'g15', name: 'Ornament Delta 4',         image: '/assets/glass/thumbs/ornamento-delta.webp',     largeImage: '/assets/glass/large/ornamento-delta.jpg' },
    { id: 'g16', name: 'Ornament Master Carre',    image: '/assets/glass/thumbs/ornamento-master.webp',    largeImage: '/assets/glass/large/ornamento-master.jpg' },
    { id: 'g17', name: 'Ornament Silvit 4',        image: '/assets/glass/thumbs/ornamento-silvit.webp',    largeImage: '/assets/glass/large/ornamento-silvit.jpg' },
    { id: 'g18', name: 'Stopsol blue 6',            image: '/assets/glass/thumbs/stopsol-blue-6.webp',      largeImage: '/assets/glass/large/stopsol-blue-6.jpg' },
    { id: 'g19', name: 'Stopsol brown 6',          image: '/assets/glass/thumbs/stopsol-brown-6.webp',     largeImage: '/assets/glass/large/stopsol-brown-6.jpg' },
    { id: 'g20', name: 'Waterfall 105',             image: '/assets/glass/thumbs/waterfall-105.webp',       largeImage: '/assets/glass/large/waterfall-105.jpg' },
  ],
  hardware: [],
  accessories: []
};


export const MB_79N_SI_DETAIL: ProductDetailData = {
  id: 'mb-79n-si',
  slug: 'mb-79n-si',
  name: 'MB-79N SI',
  tagline: 'Choose Energy Efficiency',
  description: 'The MB-86N SI window system is a modern aluminium solution designed to offer high thermal and acoustic insulation parameters. It is an excellent choice for energy-efficient buildings.',
  heroImage: '/assets/mb-79n-si/hero-bg.webp',
  windowPhoto: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  profileImage: '/assets/mb-79n-si/profile.png',
  blueprintImage: '/assets/mb-79n-si/blueprint.png',
  videoSrc: '/assets/mb-79n-si/hero-video.mp4',
  inlineVideoSrc: '/assets/mb-79n-si/okno-mb79n.mp4',
  keySpecs: [
    { label: 'gaskets', value: '2' },
    { label: 'thermal', value: 'Uw = 0,81 W/(m2K)*' },
    { label: 'chambers', value: '3' },
    { label: 'depth', value: '70 mm' }
  ],
  standardEquipment: [
    "High thermal insulation profile",
    "Modern aluminium frame",
    "Triple glazing options"
  ],
  colors: FULL_RAL_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 ("safety") matt film',     image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: '44.4 anti-burglary',            image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g4',  name: 'Antisol Dark Blue 6',       image: '/assets/glass/thumbs/antisol-blue-6.webp',      largeImage: '/assets/glass/large/antisol-blue-6.jpg' },
    { id: 'g5',  name: 'Antisol grey 6',            image: '/assets/glass/thumbs/antisol-grey-6.webp',      largeImage: '/assets/glass/large/antisol-grey-6.jpg' },
    { id: 'g6',  name: 'Antisol brown 4',          image: '/assets/glass/thumbs/antisol-brown-4.webp',     largeImage: '/assets/glass/large/antisol-brown-4.jpg' },
    { id: 'g7',  name: 'Antisol brown 6',          image: '/assets/glass/thumbs/antisol-brown-6.webp',     largeImage: '/assets/glass/large/antisol-brown-6.jpg' },
    { id: 'g8',  name: 'Antisol green 4',           image: '/assets/glass/thumbs/antisol-green-4.webp',     largeImage: '/assets/glass/large/antisol-green-4.jpg' },
    { id: 'g9',  name: 'Antisol green 6',           image: '/assets/glass/thumbs/antisol-green-6.webp',     largeImage: '/assets/glass/large/antisol-green-6.jpg' },
    { id: 'g10', name: 'Chinchilla white 4',       image: '/assets/glass/thumbs/chinchilla-4.webp',        largeImage: '/assets/glass/large/chinchilla-4.jpg' },
    { id: 'g11', name: 'Float 4',                   image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' },
    { id: 'g12', name: 'Float 6',                   image: '/assets/glass/thumbs/float-6.webp',             largeImage: '/assets/glass/large/float-6.jpg' },
    { id: 'g13', name: 'Mirastar',                  image: '/assets/glass/thumbs/mirastar.webp',            largeImage: '/assets/glass/large/mirastar.jpg' },
    { id: 'g14', name: 'Ornament Cathedral',       image: '/assets/glass/thumbs/ornamento-cathedral.webp', largeImage: '/assets/glass/large/ornamento-cathedral.jpg' },
    { id: 'g15', name: 'Ornament Delta 4',         image: '/assets/glass/thumbs/ornamento-delta.webp',     largeImage: '/assets/glass/large/ornamento-delta.jpg' },
    { id: 'g16', name: 'Ornament Master Carre',    image: '/assets/glass/thumbs/ornamento-master.webp',    largeImage: '/assets/glass/large/ornamento-master.jpg' },
    { id: 'g17', name: 'Ornament Silvit 4',        image: '/assets/glass/thumbs/ornamento-silvit.webp',    largeImage: '/assets/glass/large/ornamento-silvit.jpg' },
    { id: 'g18', name: 'Stopsol blue 6',            image: '/assets/glass/thumbs/stopsol-blue-6.webp',      largeImage: '/assets/glass/large/stopsol-blue-6.jpg' },
    { id: 'g19', name: 'Stopsol brown 6',          image: '/assets/glass/thumbs/stopsol-brown-6.webp',     largeImage: '/assets/glass/large/stopsol-brown-6.jpg' },
    { id: 'g20', name: 'Waterfall 105',             image: '/assets/glass/thumbs/waterfall-105.webp',       largeImage: '/assets/glass/large/waterfall-105.jpg' },
  ],
  hardware: [],
  accessories: []
};


export const MB_70HI_DETAIL: ProductDetailData = {
  id: 'mb-70hi',
  slug: 'mb-70hi',
  name: 'MB-70HI',
  tagline: 'Lightweight, durable, thermally efficient aluminium',
  description: 'Aluminium windows made using this system can be used in both individual buildings and aluminium facades.The lightweight and durable construction ensures a high level of comfort for many years of use.',
  heroImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  windowPhoto: '/assets/mb-70hi/mb_70_hi_profil_kolor_0.png',
  profileImage: '/assets/mb-70hi/mb_70_hi_profil_kolor_0.png',
  blueprintImage: '/assets/mb-70hi/mb-70hi_okno_c.png',
  videoSrc: '/assets/mb-70hi/okno_mb_70.mp4',
  inlineVideoSrc: '',
  keySpecs: [
    { label: 'thermal', value: 'Uw = 0.96 W/(m²K)*' },
    { label: 'depth', value: '70 mm' },
    { label: 'sealing', value: '3' },
    { label: 'glazing', value: '23.5-62 mm' }
  ],
  standardEquipment: [
    'MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anticorrosion coating for long-lasting protection and smooth operation of the fitting',
    'sash lifter (lifting mishandling device - depending on window height)',
    'microventilation in tilt and turn windows',
    'hinge covers in 3 colours: white, silver, brown',
    'aluminium handle',
    '2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)',
    'glass-pane spacer made of galvanised steel',
    '1 EPDM gaskets + 1 central gasket made of foamed EPDM, gaskets available in black',
    'RAL matt color: white (9016), anthracite (7016)'
  ],
  colors: FULL_RAL_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: 'Float 4',                  image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  hardware: [],
  accessories: []
};

export const MB_70_DETAIL: ProductDetailData = {
  id: 'mb-70',
  slug: 'mb-70',
  name: 'MB-70',
  tagline: 'MB-70',
  description: 'Aluminium windows made using this system can be used in both individual buildings and aluminium facades. The lightweight and durable construction ensures a high level of comfort for many years of use.',
  heroImage: '/assets/mb-70/profile.png',
  windowPhoto: '/assets/mb-70/profile.png',
  profileImage: '/assets/mb-70/profile.png',
  blueprintImage: '/assets/mb-70/blueprint.png',
  videoSrc: '/assets/mb-70/okno-mb70-cover.mp4',
  inlineVideoSrc: '/assets/mb-70/okno_mb_70.mp4',
  keySpecs: [
    { label: 'thermal', value: 'Uw = 1.06 W/(m²K)*' },
    { label: 'depth', value: '70 mm' },
    { label: 'sealing', value: '3' },
    { label: 'glazing', value: '23.5-62 mm' }
  ],
  standardEquipment: [
    'MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anticorrosion coating for long-lasting protection and smooth operation of the fitting',
    'sash lifter (lifting mishandling device - depending on window height)',
    'microventilation in tilt and turn windows',
    'hinge covers in 3 colours: white, silver, brown',
    'aluminium handle',
    '2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)',
    'glass-pane spacer made of galvanised steel',
    '1 EPDM gaskets + 1 central gasket made of foamed EPDM, gaskets available in black',
    'RAL matt color: white (9016), anthracite (7016)'
  ],
  colors: FULL_RAL_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: 'Float 4',                  image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  hardware: [],
  accessories: []
};

export const MB_45_DETAIL: ProductDetailData = {
  id: 'mb-45',
  slug: 'mb-45',
  name: 'MB-45',
  tagline: 'MB-45',
  description: 'MB-45 aluminium window system for applications requiring less thermal insulation.',
  heroImage: '/assets/mb-45/profile.png',
  windowPhoto: '/assets/mb-45/profile.png',
  profileImage: '/assets/mb-45/profile.png',
  blueprintImage: '/assets/mb-45/blueprint.png',
  videoSrc: '',
  inlineVideoSrc: '/assets/mb-45/okno_mb_45.mp4',
  keySpecs: [
    { label: 'thermal', value: '—' },
    { label: 'depth', value: '45 mm' },
    { label: 'sealing', value: '2' },
    { label: 'glazing', value: '1.5-37 mm' }
  ],
  standardEquipment: [
    'MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anticorrosion coating for long-lasting protection and smooth operation of the fitting',
    'sash lifter (lifting mishandling device - depending on window height)',
    'microventilation in tilt and turn windows',
    'hinge covers in 3 colours: white, silver, brown',
    'aluminium handle',
    '2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)',
    'glass-pane spacer made of galvanised steel',
    '2 EPDM gaskets available in black',
    'RAL matt color: white (9016), anthracite (7016)'
  ],
  colors: FULL_RAL_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: 'Float 4',                  image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  hardware: [],
  accessories: []
};

export const SOFTLINE_COLORS: SwatchColor[] = [
  { id: 'c202', name: 'Bleached Oak', image: '/assets/windowcolors/textures/dab-bielony.jpg', windowImage: '/assets/softline/window.png', hex: '#E6D2B5', group: 'Wood Effect' },
  { id: 'c227', name: 'Dark Oak', image: '/assets/windowcolors/textures/ciemny-dab_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#4A3B32', group: 'Wood Effect' },
  { id: 'c225', name: 'Douglas Fir', image: '/assets/windowcolors/textures/daglezja_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#8B5A2B', group: 'Wood Effect' },
  { id: 'c229', name: 'Macore', image: '/assets/windowcolors/textures/macore_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#7A3822', group: 'Wood Effect' },
  { id: 'c230', name: 'Mahogany', image: '/assets/windowcolors/textures/machoa_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#4B2A20', group: 'Wood Effect' },
  { id: 'c203', name: 'Natural Oak', image: '/assets/windowcolors/textures/dab-naturalny.jpg', windowImage: '/assets/softline/window.png', hex: '#A88B63', group: 'Wood Effect' },
  { id: 'c224', name: 'Oregon', image: '/assets/windowcolors/textures/oregon_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#94663A', group: 'Wood Effect' },
  { id: 'c220', name: 'Turner Oak', image: '/assets/windowcolors/textures/turner-oak-2023.jpg', windowImage: '/assets/softline/window.png', hex: '#634A33', group: 'Wood Effect' },
  { id: 'c226', name: 'Walnut', image: '/assets/windowcolors/textures/orzech-a.jpg', windowImage: '/assets/softline/window.png', hex: '#3E2A1D', group: 'Wood Effect' },
  { id: 'c223', name: 'Winchester', image: '/assets/windowcolors/textures/winchester_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#825936', group: 'Wood Effect' },
  { id: 'c219', name: 'Golden Oak', image: '/assets/windowcolors/textures/zaoty-dab_kk.jpg', windowImage: '/assets/softline/window.png', hex: '#8E5B23', group: 'Wood Effect' },
];

export const SOFTLINE_DETAIL: ProductDetailData = {
  id: 'softline',
  slug: 'softline',
  name: 'SOFTLINE',
  tagline: 'Classic Wooden Elegance',
  description: 'Our wooden windows mean the highest quality, environmentally friendly solutions and classic elegance. The remarkable window durability is ensured by an aluminium bead that protects wood from UV and water. The beautiful form of the rounded profile of the window with a streamlined shape and a smooth and shiny surface. The Softline series is available in pine and meranti.',
  heroImage: '/assets/softline/jasny_dab-a_1.png',
  windowPhoto: '/assets/softline/jasny_dab-a_1.png',
  profileImage: '/assets/softline/jasny_dab-a_1.png',
  blueprintImage: '',
  videoSrc: '/assets/softline/softline_68_okna.mp4',
  inlineVideoSrc: '/assets/softline/softline-88.mp4',
  profileVariants: [
    { name: 'Softline 68', image: '/assets/softline/softline_68_okno.png' },
    { name: 'Softline 78', image: '/assets/softline/softline_78_okno.png' },
    { name: 'Softline 88', image: '/assets/softline/softline_88_okno.png' }
  ],
  keySpecs: [
    { label: 'thermal', value: 'Uw = 0.8 W/(m²K)*' },
    { label: 'depth', value: '68-88 mm' },
    { label: 'sealing', value: '2' },
    { label: 'glazing', value: 'up to 54 mm' }
  ],
  standardEquipment: [
    'MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anticorrosion coating for long-lasting protection and smooth operation of the fitting',
    'sash lifter (lifting mishandling device - depending on window height)',
    'microventilation in tilt and turn windows',
    'hinge covers in 3 colours: white, silver, brown',
    'aluminium handle',
    '2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)',
    'glass-pane spacer made of galvanised steel',
    'drip cap facilitating water drainage',
    '2 EPDM gaskets'
  ],
  colors: [
  { id: 'softline-dark-oak-meranti', name: 'Dark Oak', group: 'Meranti', image: '/assets/softline/colors/dark-oak-meranti-bg.webp', windowImage: '/assets/softline/colors/dark-oak-meranti-frame.webp', profileImage: '/assets/softline/colors/dark-oak-meranti-img.webp' },
  { id: 'softline-dark-oak-pine', name: 'Dark Oak', group: 'Pine', image: '/assets/softline/colors/dark-oak-pine-bg.webp', windowImage: '/assets/softline/colors/dark-oak-pine-frame.webp', profileImage: '/assets/softline/colors/dark-oak-pine-img.webp' },
  { id: 'softline-teak-pine', name: 'Teak', group: 'Pine', image: '/assets/softline/colors/teak-pine-bg.webp', windowImage: '/assets/softline/colors/teak-pine-frame.webp', profileImage: '/assets/softline/colors/teak-pine-img.webp' },
  { id: 'softline-teak-meranthi', name: 'Teak', group: 'Meranthi', image: '/assets/softline/colors/teak-meranthi-bg.webp', windowImage: '/assets/softline/colors/teak-meranthi-frame.webp', profileImage: '/assets/softline/colors/teak-meranthi-img.webp' },
  { id: 'softline-nut-pine', name: 'Nut', group: 'Pine', image: '/assets/softline/colors/nut-pine-bg.webp', windowImage: '/assets/softline/colors/nut-pine-frame.webp', profileImage: '/assets/softline/colors/nut-pine-img.webp' },
  { id: 'softline-white-softline', name: 'White Softline', group: 'Opaque', image: '/assets/softline/colors/white-softline-bg.webp', windowImage: '/assets/softline/colors/white-softline-frame.webp', profileImage: '/assets/softline/colors/white-softline-img.webp' },
  { id: 'softline-maghoni-pine', name: 'Maghoni', group: 'Pine', image: '/assets/softline/colors/maghoni-pine-bg.webp', windowImage: '/assets/softline/colors/maghoni-pine-frame.webp', profileImage: '/assets/softline/colors/maghoni-pine-img.webp' },
  { id: 'softline-maghoni-meranthi', name: 'Maghoni', group: 'Meranthi', image: '/assets/softline/colors/maghoni-meranthi-bg.webp', windowImage: '/assets/softline/colors/maghoni-meranthi-frame.webp', profileImage: '/assets/softline/colors/maghoni-meranthi-img.webp' },
  { id: 'softline-bright-oak-pine', name: 'Bright oak', group: 'Pine', image: '/assets/softline/colors/bright-oak-pine-bg.webp', windowImage: '/assets/softline/colors/bright-oak-pine-frame.webp', profileImage: '/assets/softline/colors/bright-oak-pine-img.webp' },
  { id: 'softline-bright-oak-meranthi', name: 'Bright oak', group: 'Meranthi', image: '/assets/softline/colors/bright-oak-meranthi-bg.webp', windowImage: '/assets/softline/colors/bright-oak-meranthi-frame.webp', profileImage: '/assets/softline/colors/bright-oak-meranthi-img.webp' },
  { id: 'softline-palisander-pine', name: 'Palisander', group: 'Pine', image: '/assets/softline/colors/palisander-pine-bg.webp', windowImage: '/assets/softline/colors/palisander-pine-frame.webp', profileImage: '/assets/softline/colors/palisander-pine-img.webp' },
  { id: 'softline-palisander-meranthi', name: 'Palisander', group: 'Meranthi', image: '/assets/softline/colors/palisander-meranthi-bg.webp', windowImage: '/assets/softline/colors/palisander-meranthi-frame.webp', profileImage: '/assets/softline/colors/palisander-meranthi-img.webp' },
  { id: 'softline-nut-meranthi', name: 'Nut', group: 'Meranthi', image: '/assets/softline/colors/nut-meranthi-bg.webp', windowImage: '/assets/softline/colors/nut-meranthi-frame.webp', profileImage: '/assets/softline/colors/nut-meranthi-img.webp' },
  ],
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: 'Float 4',                  image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  hardware: [],
  accessories: []
};

export const DUOLINE_DETAIL: ProductDetailData = {
  id: 'duoline',
  slug: 'duoline',
  name: 'DUOLINE',
  tagline: 'Wood-Aluminium Hybrid',
  description: 'These windows are a perfect combination of timeless classic wood with a lightweight and extremely durable form of aluminium. Numerous additional options will help you create the windows to meet all of your expectations.',
  heroImage: '/assets/softline/window.png',
  windowPhoto: '/assets/softline/window.png',
  profileImage: '/assets/softline/window.png',
  blueprintImage: '/assets/softline/window.png',
  videoSrc: '',
  inlineVideoSrc: '',
  keySpecs: [
    { label: 'thermal', value: 'from Uw = 0.79 W/(m²K)*' },
    { label: 'depth', value: '68-88 mm + 14 mm spacer' },
    { label: 'sealing', value: '3' },
    { label: 'glazing', value: 'up to 50 mm' }
  ],
  standardEquipment: [
    'MACO MULTI-MATIC KS fittings with 2 anti-theft strikers with Silber-Look anticorrosion coating for long-lasting protection and smooth operation of the fitting',
    'sash lifter (lifting mishandling device - depending on window height)',
    'microventilation in tilt and turn windows',
    'hinge covers in 3 colours: white, silver, brown',
    'aluminium handle',
    '2-glazed (1-chamber) units infilled with argon gas with Ug = 1.1 W/(m²K)',
    'glass-pane spacer made of galvanised steel',
    'drip cap facilitating water drainage',
    '3 EPDM gaskets'
  ],
  colors: SOFTLINE_COLORS,
  outdoorColors: FULL_RAL_COLORS,
  outdoorWindowPhoto: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: 'Float 4',                  image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  hardware: [],
  accessories: []
};


export const IGLO5_DOORS_DETAIL: ProductDetailData = {
  id: 'iglo5-doors',
  slug: 'iglo5-doors',
  name: 'IGLO 5 DOORS',
  tagline: 'Reliable PVC Doors',
  description: 'Classic door system featuring a 5-chamber profile for great thermal insulation and durability.',
  heroImage: 'https://www.drutex.eu/media/_versions/sections/inspirations/przedpokoj/drzwi-iglo-energy-przedpokoj2_inspiration_section.jpg',
  windowPhoto: 'https://www.drutex.eu/media/_versions/sections/inspirations/przedpokoj/drzwi-iglo-energy-przedpokoj2_inspiration_section.jpg',
  profileImage: 'https://www.drutex.eu/media/_versions/sections/inspirations/przedpokoj/drzwi-iglo-energy-przedpokoj2_inspiration_section.jpg',
  blueprintImage: 'https://www.drutex.eu/media/_versions/sections/inspirations/przedpokoj/drzwi-iglo-energy-przedpokoj2_inspiration_section.jpg',
  videoSrc: '',
  inlineVideoSrc: '',
  keySpecs: [
    { label: 'thermal', value: 'Ud = 1.0 W/(m²K)*' },
    { label: 'depth', value: '70 mm' },
    { label: 'sealing', value: '2' },
    { label: 'infills', value: '22.5-41 mm' }
  ],
  standardEquipment: [
    '3-point espagnolette',
    '3 two-winged hinges',
    'Ug = 1,1 W/(m2K) glass',
    'threshold with a thermal break',
    'aluminium handle',
    'mounting insert'
  ],
  colors: IGLO_EDGE_COLORS,
  infills: [
    { name: 'Pattern 1', image: '/assets/glass/thumbs/segura-331.webp', largeImage: '/assets/glass/large/segura-331.jpg' },
    { name: 'Pattern 2', image: '/assets/glass/thumbs/segura-332-mat.webp', largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { name: 'Pattern 3', image: '/assets/glass/thumbs/float-4.webp', largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  features: [
    {
      title: 'Door structures',
      description: 'Modern architecture often requires from us to design door structures with different dimensions, shapes, specifications, etc. They determine not only the look of the door but also its functional properties, stability, and durability. The spacers used in Drutex doors help significantly increase door rigidity and at the same time ensure a unique, custom design.',
      image: 'https://www.drutex.eu/media/_versions/sections/inspirations/przedpokoj/drzwi-iglo-energy-przedpokoj1_inspiration_section.jpg'
    }
  ],
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' }
  ],
  hardware: [],
  accessories: []
};

export const IGLO_ENERGY_DOORS_PVC_DETAIL: ProductDetailData = {
  id: 'iglo-energy-doors',
  slug: 'iglo-energy-doors',
  name: 'IGLO ENERGY DOORS',
  tagline: 'World-leading design and excellent parameters',
  description: 'The Iglo Energy PVC exterior entrance door means modern and beautiful design, energy efficiency as well as aesthetic values and perfect functionality.',
  heroImage: '/assets/iglo-energy-doors/door.webp',
  windowPhoto: '/assets/iglo-energy-doors/door.webp',
  profileImage: '/assets/iglo-energy-doors/profile.webp',
  blueprintImage: '/assets/iglo-energy-doors/profile.webp',
  videoSrc: '/assets/iglo-energy-doors/hero.mp4',
  inlineVideoSrc: '',
  keySpecs: [
    { label: 'thermal', value: 'Ud = 0.8 W/(m²K)*' },
    { label: 'depth', value: '82 mm' },
    { label: 'sealing', value: '3' },
    { label: 'infills', value: '22.5-49.5 mm' }
  ],
  standardEquipment: [
    '3-point espagnolette',
    '3 two-winged hinges',
    'Ug = 1,1 W/(m2K) glass',
    'threshold with a thermal break',
    'aluminium handle',
    'mounting insert'
  ],
  colors: IGLO_EDGE_COLORS,
  infills: [
    { name: 'DX-01', image: '/assets/iglo-energy-doors/infills/dx-01.webp', largeImage: '/assets/iglo-energy-doors/infills/dx-01.webp' },
    { name: 'DX-02', image: '/assets/iglo-energy-doors/infills/dx-02.webp', largeImage: '/assets/iglo-energy-doors/infills/dx-02.webp' },
    { name: 'DX-03', image: '/assets/iglo-energy-doors/infills/dx-03.webp', largeImage: '/assets/iglo-energy-doors/infills/dx-03.webp' },
    { name: 'DX-04', image: '/assets/iglo-energy-doors/infills/dx-04.webp', largeImage: '/assets/iglo-energy-doors/infills/dx-04.webp' },
    { name: 'DX-05', image: '/assets/iglo-energy-doors/infills/dx-05.webp', largeImage: '/assets/iglo-energy-doors/infills/dx-05.webp' }
  ],
  features: [
    {
      title: 'Door structures',
      description: 'Modern architecture often requires from us to design door structures with different dimensions, shapes, specifications, etc. They determine not only the look of the door but also its functional properties, stability, and durability. The spacers used in Drutex doors help significantly increase door rigidity and at the same time ensure a unique, custom design.',
      image: '/assets/iglo-energy-doors/door-structure.webp'
    }
  ],
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' }
  ],
  hardware: [],
  accessories: []
};

