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

