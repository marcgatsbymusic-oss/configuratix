import { JSDOM } from 'jsdom';

(async () => {
  const res = await fetch('https://www.drutex.eu/en/products/iglo5-doors-pvc.html');
  const html = await res.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // Find the color elements
  const items = Array.from(document.querySelectorAll('.animate-change-color-element'));
  const colors = items.map(el => {
    return {
      name: el.getAttribute('data-name'),
      code: el.getAttribute('data-code'),
      img: el.getAttribute('data-img'),
      bg: el.getAttribute('data-bg')
    };
  });
  
  console.log(JSON.stringify(colors, null, 2));
})();
