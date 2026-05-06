export interface InspirationItem {
  image: string;
  name: string;
  productLink?: string;
}

export interface InspirationCategory {
  [key: string]: InspirationItem[];
}

export interface InspirationTab {
  id: number;
  label: string;
  href: string;
}

export const INSPIRATION_TABS: InspirationTab[] = [
  {
    "id": 4,
    "label": "Exterior Wall Finishes",
    "href": "/en/inspiration/other/"
  },
  {
    "id": 2,
    "label": "Hall",
    "href": "/en/inspiration/hall/"
  },
  {
    "id": 3,
    "label": "Kitchen",
    "href": "/en/inspiration/kitchen/"
  },
  {
    "id": 1,
    "label": "Livingroom",
    "href": "/en/inspiration/livingroom/"
  },
  {
    "id": 5,
    "label": "Bedroom",
    "href": "/en/inspiration/bedroom/"
  },
  {
    "id": 13,
    "label": "Bathroom",
    "href": "/en/inspiration/bathroom/"
  },
  {
    "id": 52,
    "label": "Terrace",
    "href": "/en/inspiration/terrace/"
  },
  {
    "id": 4,
    "label": "Exterior Wall Finishes",
    "href": "/en/inspiration/other/"
  },
  {
    "id": 2,
    "label": "Hall",
    "href": "/en/inspiration/hall/"
  },
  {
    "id": 3,
    "label": "Kitchen",
    "href": "/en/inspiration/kitchen/"
  },
  {
    "id": 1,
    "label": "Livingroom",
    "href": "/en/inspiration/livingroom/"
  },
  {
    "id": 5,
    "label": "Bedroom",
    "href": "/en/inspiration/bedroom/"
  },
  {
    "id": 13,
    "label": "Bathroom",
    "href": "/en/inspiration/bathroom/"
  },
  {
    "id": 52,
    "label": "Terrace",
    "href": "/en/inspiration/terrace/"
  }
];

export const INSPIRATIONS_DATA: InspirationCategory = {
  "1": [
    {
      "image": "/assets/inspirations/1-0-iglo-edge-slide.webp",
      "name": "Iglo Edge Slide",
      "productLink": "/products/iglo-edge-slide"
    },
    {
      "image": "/assets/inspirations/1-1-iglo-edge-slide.webp",
      "name": "Iglo Edge Slide",
      "productLink": "/products/iglo-edge-slide"
    },
    {
      "image": "/assets/inspirations/1-2-iglo-edge-slide.webp",
      "name": "Iglo Edge Slide",
      "productLink": "/products/iglo-edge-slide"
    },
    {
      "image": "/assets/inspirations/1-3-iglo-edge-slide.webp",
      "name": "Iglo Edge Slide",
      "productLink": "/products/iglo-edge-slide"
    },
    {
      "image": "/assets/inspirations/1-4-iglo-edge.webp",
      "name": "Iglo Edge",
      "productLink": "/products/iglo-edge"
    },
    {
      "image": "/assets/inspirations/1-5-iglo-edge.webp",
      "name": "Iglo Edge",
      "productLink": "/products/iglo-edge"
    },
    {
      "image": "/assets/inspirations/1-6-iglo-edge.webp",
      "name": "Iglo Edge",
      "productLink": "/products/iglo-edge"
    },
    {
      "image": "/assets/inspirations/1-7-mb-77hs.webp",
      "name": "MB-77HS",
      "productLink": "/products/mb-77hs"
    },
    {
      "image": "/assets/inspirations/1-8-harmonijka-softline-68.webp",
      "name": "Harmonijka Softline 68",
      "productLink": "/products/softline-68"
    },
    {
      "image": "/assets/inspirations/1-9-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-doors-alu"
    },
    {
      "image": "/assets/inspirations/1-10-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    },
    {
      "image": "/assets/inspirations/1-11-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/1-12-mb-86si-fold-line.webp",
      "name": "MB-86SI Fold Line",
      "productLink": "/products/mb-86-fold-line"
    },
    {
      "image": "/assets/inspirations/1-13-harmonijka-softline-68.webp",
      "name": "Harmonijka Softline 68",
      "productLink": "/products/softline-68"
    },
    {
      "image": "/assets/inspirations/1-14-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/1-15-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/1-16-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/1-17-iglo-ext.webp",
      "name": "Iglo EXT",
      "productLink": "/products/iglo-ext"
    },
    {
      "image": "/assets/inspirations/1-18-mb-70hi-psk.webp",
      "name": "MB-70HI PSK",
      "productLink": "/products/mb-70-mb-70hi-psk"
    },
    {
      "image": "/assets/inspirations/1-19-psk-softline.webp",
      "name": "PSK Softline",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/1-20-softline-hs.webp",
      "name": "Softline HS",
      "productLink": "/products/softline-hs"
    },
    {
      "image": "/assets/inspirations/1-21-mb-77-hi.webp",
      "name": "MB-77 HI",
      "productLink": "/products/mb-77hs"
    },
    {
      "image": "/assets/inspirations/1-22-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/1-23-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy"
    },
    {
      "image": "/assets/inspirations/1-24-mb-86-fold-line.webp",
      "name": "MB-86 Fold Line",
      "productLink": "/products/mb-86-fold-line"
    },
    {
      "image": "/assets/inspirations/1-25-iglo-energy-psk.webp",
      "name": "Iglo Energy PSK",
      "productLink": "/products/iglo-energy-psk"
    },
    {
      "image": "/assets/inspirations/1-26-softline-hs.webp",
      "name": "Softline HS",
      "productLink": "/products/softline-hs"
    },
    {
      "image": "/assets/inspirations/1-27-softline-hs.webp",
      "name": "Softline HS",
      "productLink": "/products/softline-hs"
    },
    {
      "image": "/assets/inspirations/1-28-psk-duoline.webp",
      "name": "PSK Duoline",
      "productLink": "/products/duoline-psk"
    },
    {
      "image": "/assets/inspirations/1-29-softline-88.webp",
      "name": "Softline 88",
      "productLink": "/products/duoline"
    },
    {
      "image": "/assets/inspirations/1-30-iglo-light.webp",
      "name": "Iglo Light",
      "productLink": "/products/iglo-light"
    },
    {
      "image": "/assets/inspirations/1-31-iglo-light.webp",
      "name": "Iglo Light",
      "productLink": "/products/iglo-light"
    },
    {
      "image": "/assets/inspirations/1-32-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy"
    },
    {
      "image": "/assets/inspirations/1-33-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    },
    {
      "image": "/assets/inspirations/1-34-duoline-78.webp",
      "name": "Duoline 78",
      "productLink": "/products/duoline"
    },
    {
      "image": "/assets/inspirations/1-35-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-windows-alu"
    },
    {
      "image": "/assets/inspirations/1-36-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-windows-alu"
    },
    {
      "image": "/assets/inspirations/1-37-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68"
    },
    {
      "image": "/assets/inspirations/1-38-duoline-hs.webp",
      "name": "Duoline HS",
      "productLink": "/products/duoline-hs"
    },
    {
      "image": "/assets/inspirations/1-39-duoline-hs.webp",
      "name": "Duoline HS",
      "productLink": "/products/duoline-hs"
    },
    {
      "image": "/assets/inspirations/1-40-duoline-hs.webp",
      "name": "Duoline HS",
      "productLink": "/products/duoline-hs"
    },
    {
      "image": "/assets/inspirations/1-41-iglo-light.webp",
      "name": "Iglo Light",
      "productLink": "/products/iglo-light"
    },
    {
      "image": "/assets/inspirations/1-42-iglo-5-classic.webp",
      "name": "Iglo 5 Classic",
      "productLink": "/products/iglo5-classic"
    },
    {
      "image": "/assets/inspirations/1-43-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/1-44-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/1-45-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/1-46-iglo-energy-psk.webp",
      "name": "Iglo Energy PSK",
      "productLink": "/products/iglo-energy-psk"
    },
    {
      "image": "/assets/inspirations/1-47-duoline-78.webp",
      "name": "Duoline 78",
      "productLink": "/products/duoline"
    },
    {
      "image": "/assets/inspirations/1-48-duoline-78.webp",
      "name": "Duoline 78",
      "productLink": "/products/duoline"
    },
    {
      "image": "/assets/inspirations/1-49-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68"
    },
    {
      "image": "/assets/inspirations/1-50-mb-70-hi-psk.webp",
      "name": "MB-70 HI PSK",
      "productLink": "/products/mb-70-mb-70hi-psk"
    },
    {
      "image": "/assets/inspirations/1-51-duoline-68.webp",
      "name": "Duoline 68",
      "productLink": "/products/duoline"
    },
    {
      "image": "/assets/inspirations/1-52-iglo-light-psk.webp",
      "name": "Iglo Light PSK",
      "productLink": "/products/iglo-light-psk"
    },
    {
      "image": "/assets/inspirations/1-53-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-windows-alu"
    },
    {
      "image": "/assets/inspirations/1-54-duoline-hs.webp",
      "name": "Duoline HS",
      "productLink": "/products/duoline-hs"
    }
  ],
  "2": [
    {
      "image": "/assets/inspirations/2-0-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5-doors-pvc"
    },
    {
      "image": "/assets/inspirations/2-1-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/2-2-psk-iglo-energy.webp",
      "name": "PSK Iglo Energy",
      "productLink": "/products/iglo-energy-psk"
    },
    {
      "image": "/assets/inspirations/2-3-mb-78-ei.webp",
      "name": "MB-78 EI",
      "productLink": "/products/mb-78ei-przeciwpozarowe"
    },
    {
      "image": "/assets/inspirations/2-4-mb-78-ei.webp",
      "name": "MB-78 EI",
      "productLink": "/products/mb-78ei-przeciwpozarowe"
    },
    {
      "image": "/assets/inspirations/2-5-mb-78-ei.webp",
      "name": "MB-78 EI",
      "productLink": "/products/mb-78ei-przeciwpozarowe"
    },
    {
      "image": "/assets/inspirations/2-6-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-7-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-8-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-9-star.webp",
      "name": "Star",
      "productLink": "/products/star-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-10-mb-86si.webp",
      "name": "MB-86SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-11-mb-70hi.webp",
      "name": "MB-70HI",
      "productLink": "/products/mb-70hi-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-12-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-13-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/2-14-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/2-15-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/2-16-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5-doors-pvc"
    }
  ],
  "3": [
    {
      "image": "/assets/inspirations/3-0-aluzje-fasadowe-s90.webp",
      "name": "Żaluzje fasadowe S90",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/3-1-mb-86si.webp",
      "name": "MB-86SI",
      "productLink": "/products/mb-86si-windows-alu"
    },
    {
      "image": "/assets/inspirations/3-2-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/3-3-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/3-4-mb-86-fold-line.webp",
      "name": "MB-86 Fold Line",
      "productLink": "/products/mb-86-fold-line"
    },
    {
      "image": "/assets/inspirations/3-5-softline-hs.webp",
      "name": "Softline HS",
      "productLink": "/products/softline-hs"
    },
    {
      "image": "/assets/inspirations/3-6-psk-iglo-5.webp",
      "name": "PSK Iglo 5",
      "productLink": "/products/iglo5-psk"
    },
    {
      "image": "/assets/inspirations/3-7-mb-77-hs-mb-77-hs-hi.webp",
      "name": "MB-77 HS / MB-77 HS HI",
      "productLink": "/products/mb-77hs"
    },
    {
      "image": "/assets/inspirations/3-8-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/3-9-iglo-energy-classic.webp",
      "name": "Iglo Energy Classic",
      "productLink": "/products/iglo-energy-classic"
    },
    {
      "image": "/assets/inspirations/3-10-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/3-11-psk-iglo-5.webp",
      "name": "PSK Iglo 5",
      "productLink": "/products/iglo5-psk"
    },
    {
      "image": "/assets/inspirations/3-12-mb-77-hs-mb-77-hs-hi.webp",
      "name": "MB-77 HS / MB-77 HS HI",
      "productLink": "/products/mb-77hs"
    },
    {
      "image": "/assets/inspirations/3-13-iglo-5-classic.webp",
      "name": "Iglo 5 Classic",
      "productLink": "/products/iglo5-classic"
    },
    {
      "image": "/assets/inspirations/3-14-mb-70-psk.webp",
      "name": "MB-70 PSK",
      "productLink": "/products/mb-70-mb-70hi-psk"
    },
    {
      "image": "/assets/inspirations/3-15-iglo-light.webp",
      "name": "Iglo Light",
      "productLink": "/products/iglo-light"
    },
    {
      "image": "/assets/inspirations/3-16-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    },
    {
      "image": "/assets/inspirations/3-17-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/3-18-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/3-19-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/3-20-iglo-5-classic.webp",
      "name": "Iglo 5 Classic",
      "productLink": "/products/iglo5-classic"
    },
    {
      "image": "/assets/inspirations/3-21-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    }
  ],
  "4": [
    {
      "image": "/assets/inspirations/4-0-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/4-1-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/4-2-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/4-3-aluminium-shutters.webp",
      "name": "Aluminium shutters",
      "productLink": "/products/aluminium-shutters"
    },
    {
      "image": "/assets/inspirations/4-4-pvc-shutters.webp",
      "name": "PVC Shutters",
      "productLink": "/products/pvc-shutters"
    },
    {
      "image": "/assets/inspirations/4-5-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-6-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-7-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-8-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-9-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-10-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-11-mb-70-hi.webp",
      "name": "MB-70 HI",
      "productLink": "/products/mb-70hi-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-12-mb-70-hi.webp",
      "name": "MB-70 HI",
      "productLink": "/products/mb-70hi-doors-alu"
    },
    {
      "image": "/assets/inspirations/4-13-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/4-14-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/4-15-external-venetian-blinds.webp",
      "name": "External venetian blinds",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/4-16-mb-sr-50n-mb-sr-50n-hi.webp",
      "name": "MB-SR 50N / MB-SR 50N HI",
      "productLink": "/products/mb-sr50-n-sr50-n-hi-facades-alu"
    },
    {
      "image": "/assets/inspirations/4-17-mb-sr-50n-mb-sr-50n-hi.webp",
      "name": "MB-SR 50N / MB-SR 50N HI",
      "productLink": "/products/mb-sr50-n-sr50-n-hi-facades-alu"
    },
    {
      "image": "/assets/inspirations/4-18-mb-sr-50n-mb-sr-50n-hi.webp",
      "name": "MB-SR 50N / MB-SR 50N HI",
      "productLink": "/products/mb-sr50-n-sr50-n-hi-facades-alu"
    },
    {
      "image": "/assets/inspirations/4-19-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68-doors"
    },
    {
      "image": "/assets/inspirations/4-20-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68-doors"
    },
    {
      "image": "/assets/inspirations/4-21-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5-doors-pvc"
    },
    {
      "image": "/assets/inspirations/4-22-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5-doors-pvc"
    }
  ],
  "5": [
    {
      "image": "/assets/inspirations/5-0-iglo-ext.webp",
      "name": "Iglo EXT",
      "productLink": "/products/iglo-ext"
    },
    {
      "image": "/assets/inspirations/5-1-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/5-2-iglo-5-psk.webp",
      "name": "Iglo 5 PSK",
      "productLink": "/products/iglo5-psk"
    },
    {
      "image": "/assets/inspirations/5-3-iglo-5-psk.webp",
      "name": "Iglo 5 PSK",
      "productLink": "/products/iglo5-psk"
    },
    {
      "image": "/assets/inspirations/5-4-iglo-light-psk.webp",
      "name": "Iglo Light PSK",
      "productLink": "/products/iglo-light-psk"
    },
    {
      "image": "/assets/inspirations/5-5-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/5-6-duoline-68-psk.webp",
      "name": "Duoline 68 PSK",
      "productLink": "/products/duoline-psk"
    },
    {
      "image": "/assets/inspirations/5-7-iglo-light-psk.webp",
      "name": "Iglo Light PSK",
      "productLink": "/products/iglo-light-psk"
    },
    {
      "image": "/assets/inspirations/5-8-iglo-light-psk.webp",
      "name": "Iglo Light PSK",
      "productLink": "/products/iglo-light-psk"
    },
    {
      "image": "/assets/inspirations/5-9-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy"
    },
    {
      "image": "/assets/inspirations/5-10-iglo-light.webp",
      "name": "Iglo Light",
      "productLink": "/products/iglo-light"
    },
    {
      "image": "/assets/inspirations/5-11-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68"
    },
    {
      "image": "/assets/inspirations/5-12-iglo-energy-psk.webp",
      "name": "Iglo Energy PSK",
      "productLink": "/products/iglo-energy-psk"
    },
    {
      "image": "/assets/inspirations/5-13-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    },
    {
      "image": "/assets/inspirations/5-14-iglo-energy-classic.webp",
      "name": "Iglo Energy Classic",
      "productLink": "/products/iglo-energy-classic"
    },
    {
      "image": "/assets/inspirations/5-15-iglo-5-classic.webp",
      "name": "Iglo 5 Classic",
      "productLink": "/products/iglo5-classic"
    },
    {
      "image": "/assets/inspirations/5-16-mb-77-hs.webp",
      "name": "MB-77 HS",
      "productLink": "/products/mb-77hs"
    },
    {
      "image": "/assets/inspirations/5-17-mb-86si.webp",
      "name": "MB-86SI",
      "productLink": "/products/mb-86si-windows-alu"
    }
  ],
  "13": [
    {
      "image": "/assets/inspirations/13-0-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/13-1-mb-86si.webp",
      "name": "MB-86SI",
      "productLink": "/products/mb-86si-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-2-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-3-mb-70hi.webp",
      "name": "MB-70Hi",
      "productLink": "/products/mb-70hi-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-4-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-5-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-6-mb-70hi-psk.webp",
      "name": "MB-70HI PSK",
      "productLink": "/products/mb-70-mb-70hi-psk"
    },
    {
      "image": "/assets/inspirations/13-7-iglo-light-psk.webp",
      "name": "Iglo Light PSK",
      "productLink": "/products/iglo-light-psk"
    },
    {
      "image": "/assets/inspirations/13-8-mb-86si.webp",
      "name": "MB-86SI",
      "productLink": "/products/mb-86si-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-9-mb-70hi.webp",
      "name": "MB-70HI",
      "productLink": "/products/mb-70hi-windows-alu"
    },
    {
      "image": "/assets/inspirations/13-10-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    }
  ],
  "14": [
    {
      "image": "/assets/inspirations/14-0-ideal-neo.webp",
      "name": "Ideal Neo",
      "productLink": "/products/ideal-neo"
    },
    {
      "image": "/assets/inspirations/14-1-pivot-01.webp",
      "name": "PIVOT 01",
      "productLink": "/products/pivot"
    },
    {
      "image": "/assets/inspirations/14-2-pivot-03.webp",
      "name": "PIVOT 03",
      "productLink": "/products/pivot"
    },
    {
      "image": "/assets/inspirations/14-3-pivot-02.webp",
      "name": "PIVOT 02",
      "productLink": "/products/pivot"
    },
    {
      "image": "/assets/inspirations/14-4-d-gate.webp",
      "name": "D-Gate",
      "productLink": "/products/d-gate"
    },
    {
      "image": "/assets/inspirations/14-5-slime-line-38.webp",
      "name": "Slime Line 38",
      "productLink": "/products/slime-line-38"
    },
    {
      "image": "/assets/inspirations/14-6-slime-line-38.webp",
      "name": "Slime Line 38",
      "productLink": "/products/slime-line-38"
    },
    {
      "image": "/assets/inspirations/14-7-slime-line-38.webp",
      "name": "Slime Line 38",
      "productLink": "/products/slime-line-38"
    },
    {
      "image": "/assets/inspirations/14-8-slime-line-38.webp",
      "name": "Slime Line 38",
      "productLink": "/products/slime-line-38"
    },
    {
      "image": "/assets/inspirations/14-9-slime-line-38.webp",
      "name": "Slime Line 38",
      "productLink": "/products/slime-line-38"
    },
    {
      "image": "/assets/inspirations/14-10-slime-line-38.webp",
      "name": "Slime Line 38",
      "productLink": "/products/slime-line-38"
    },
    {
      "image": "/assets/inspirations/14-11-concept-patio-130.webp",
      "name": "Concept Patio 130",
      "productLink": "/products/concept-patio-130"
    },
    {
      "image": "/assets/inspirations/14-12-concept-patio-130.webp",
      "name": "Concept Patio 130",
      "productLink": "/products/concept-patio-130"
    },
    {
      "image": "/assets/inspirations/14-13-concept-patio-130.webp",
      "name": "Concept Patio 130",
      "productLink": "/products/concept-patio-130"
    },
    {
      "image": "/assets/inspirations/14-14-concept-patio-130.webp",
      "name": "Concept Patio 130",
      "productLink": "/products/concept-patio-130"
    },
    {
      "image": "/assets/inspirations/14-15-mb-79n-si.webp",
      "name": "MB-79N SI",
      "productLink": "/products/mb-79n-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-16-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-17-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-18-mb-79n-si.webp",
      "name": "MB-79N SI",
      "productLink": "/products/mb-79n-windows-alu"
    },
    {
      "image": "/assets/inspirations/14-19-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline"
    },
    {
      "image": "/assets/inspirations/14-20-mb-70hi.webp",
      "name": "MB-70HI",
      "productLink": "/products/mb-70hi-windows-alu"
    },
    {
      "image": "/assets/inspirations/14-21-ogr-d-zimowy.webp",
      "name": "Ogród zimowy",
      "productLink": "/products/ogrody-zimowe"
    },
    {
      "image": "/assets/inspirations/14-22-iglo-premier.webp",
      "name": "Iglo Premier",
      "productLink": "/products/iglo-premier"
    },
    {
      "image": "/assets/inspirations/14-23-iglo-premier.webp",
      "name": "Iglo Premier",
      "productLink": "/products/iglo-premier"
    },
    {
      "image": "/assets/inspirations/14-24-mb-wg60.webp",
      "name": "MB-WG60",
      "productLink": "/products/mb-wg60-winter-gartens-alu"
    },
    {
      "image": "/assets/inspirations/14-25-mb-wg60.webp",
      "name": "MB-WG60",
      "productLink": "/products/mb-wg60-winter-gartens-alu"
    },
    {
      "image": "/assets/inspirations/14-26-mb-wg60.webp",
      "name": "MB-WG60",
      "productLink": "/products/mb-wg60-winter-gartens-alu"
    },
    {
      "image": "/assets/inspirations/14-27-mb-wg60.webp",
      "name": "MB-WG60",
      "productLink": "/products/mb-wg60-winter-gartens-alu"
    },
    {
      "image": "/assets/inspirations/14-28-mb-45.webp",
      "name": "MB-45",
      "productLink": "/products/mb-45-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-29-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/14-30-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy-doors-pvc"
    },
    {
      "image": "/assets/inspirations/14-31-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/14-32-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/14-33-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/14-34-rolety-aluminiowe.webp",
      "name": "Rolety aluminiowe",
      "productLink": "/products/aluminium-shutters"
    },
    {
      "image": "/assets/inspirations/14-35-rolety-aluminiowe.webp",
      "name": "Rolety aluminiowe",
      "productLink": "/products/aluminium-shutters"
    },
    {
      "image": "/assets/inspirations/14-36-rolety-pvc.webp",
      "name": "Rolety PVC",
      "productLink": "/products/pvc-shutters"
    },
    {
      "image": "/assets/inspirations/14-37-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5"
    },
    {
      "image": "/assets/inspirations/14-38-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-39-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-40-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-41-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-42-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-43-mb-86-si.webp",
      "name": "MB-86 SI",
      "productLink": "/products/mb-86si-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-44-mb-70-hi.webp",
      "name": "MB-70 HI",
      "productLink": "/products/mb-70hi-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-45-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-46-mb-70.webp",
      "name": "MB-70",
      "productLink": "/products/mb-70-doors-alu"
    },
    {
      "image": "/assets/inspirations/14-47-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68-doors"
    },
    {
      "image": "/assets/inspirations/14-48-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68-doors"
    },
    {
      "image": "/assets/inspirations/14-49-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68-doors"
    },
    {
      "image": "/assets/inspirations/14-50-iglo-5.webp",
      "name": "Iglo 5",
      "productLink": "/products/iglo5-doors-pvc"
    }
  ],
  "52": [
    {
      "image": "/assets/inspirations/52-0-mb-77-monorail.webp",
      "name": "MB-77 Monorail",
      "productLink": "/products/mb-77hs-hi-monorail"
    },
    {
      "image": "/assets/inspirations/52-1-mb-77-monorail.webp",
      "name": "MB-77 Monorail",
      "productLink": "/products/mb-77hs-hi-monorail"
    },
    {
      "image": "/assets/inspirations/52-2-iglo-5-classic.webp",
      "name": "Iglo 5 Classic",
      "productLink": "/products/iglo-5-classic-psk"
    },
    {
      "image": "/assets/inspirations/52-3-aluzje-fasadowe.webp",
      "name": "Żaluzje fasadowe",
      "productLink": "/products/external-venetian-blinds"
    },
    {
      "image": "/assets/inspirations/52-4-mb-86-fold-line.webp",
      "name": "MB-86 Fold Line",
      "productLink": "/products/mb-86-fold-line"
    },
    {
      "image": "/assets/inspirations/52-5-duoline-68-psk.webp",
      "name": "Duoline 68 PSK",
      "productLink": "/products/duoline-psk"
    },
    {
      "image": "/assets/inspirations/52-6-mb-70-psk.webp",
      "name": "MB-70 PSK",
      "productLink": "/products/mb-70-mb-70hi-psk"
    },
    {
      "image": "/assets/inspirations/52-7-duoline-68-psk.webp",
      "name": "Duoline 68 PSK",
      "productLink": "/products/duoline-psk"
    },
    {
      "image": "/assets/inspirations/52-8-iglo-energy-psk.webp",
      "name": "Iglo Energy PSK",
      "productLink": "/products/iglo-energy-psk"
    },
    {
      "image": "/assets/inspirations/52-9-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/52-10-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/52-11-softline-68-psk.webp",
      "name": "Softline 68 PSK",
      "productLink": "/products/softline-psk"
    },
    {
      "image": "/assets/inspirations/52-12-aluminium-shutters.webp",
      "name": "Aluminium shutters",
      "productLink": "/products/aluminium-shutters"
    },
    {
      "image": "/assets/inspirations/52-13-iglo-energy.webp",
      "name": "Iglo Energy",
      "productLink": "/products/iglo-energy"
    },
    {
      "image": "/assets/inspirations/52-14-iglo-energy-psk.webp",
      "name": "Iglo Energy PSK",
      "productLink": "/products/iglo-energy-psk"
    },
    {
      "image": "/assets/inspirations/52-15-iglo-energy-classic.webp",
      "name": "Iglo Energy Classic",
      "productLink": "/products/pvc-shutters"
    },
    {
      "image": "/assets/inspirations/52-16-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/52-17-iglo-hs.webp",
      "name": "Iglo HS",
      "productLink": "/products/iglo-hs"
    },
    {
      "image": "/assets/inspirations/52-18-softline-68.webp",
      "name": "Softline 68",
      "productLink": "/products/softline-68-doors"
    }
  ]
};
