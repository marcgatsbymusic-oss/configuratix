import * as cheerio from 'cheerio';

async function test() {
  const res = await fetch('https://www.drutex.eu/en/products/ideal-neo-ad.html');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Find the compare products table or standard equipment list
  console.log("--- STANDARD EQUIPMENT ---");
  console.log($('.product__content, #description').text().substring(0, 500));
  
  console.log("\n--- SPECS LIST / TABLE ---");
  // Drutex usually uses some ul or table for tech specs
  $('li').each((i, el) => {
    const text = $(el).text();
    if (text.includes('Ug =') || text.includes('gaskets') || text.includes('profile')) {
      console.log(text.trim());
    }
  });

}
test();
