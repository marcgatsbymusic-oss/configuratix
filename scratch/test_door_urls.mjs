const paths = [
    '/media/_upload/produkty/drzwi-iglo5/kolory/wypelnienia-2026/iglo-5-montana-betonowy-szary.jpg',
    '/media/_upload/produkty/drzwi-iglo-5/kolory/wypelnienia-2026/iglo-5-montana-betonowy-szary.jpg',
    '/media/_upload/produkty/drzwi-iglo-5/kolory/wypelnienia-2026/iglo-5-betonowy-szary.jpg',
    '/media/_upload/produkty/drzwi-iglo-energy/kolory/wypelnienia-2026/iglo-energy-montana-betonowy-szary.jpg',
    '/media/_upload/produkty/drzwi-iglo-energy/kolory/iglo-energy-montana-betonowy-szary.jpg'
];

(async () => {
    for (const p of paths) {
        const url = 'https://www.drutex.eu' + p;
        const res = await fetch(url, { method: 'HEAD' });
        console.log(p, res.status);
    }
})();
