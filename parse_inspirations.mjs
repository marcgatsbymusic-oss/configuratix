import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('inspirations_raw.html', 'utf-8');
const $ = cheerio.load(html);

const tabs = [];
$('nav .navigation-tabs a').each((i, el) => {
    const $a = $(el);
    const href = $a.attr('href');
    const buttonText = $a.find('button').text().trim();
    // parse the category ID from the click handler, e.g. @click.prevent="$store.inspirations.toggle(4, ...)"
    const clickAttr = $a.attr('@click.prevent') || '';
    const match = clickAttr.match(/toggle\((\d+),/);
    const id = match ? parseInt(match[1]) : i;
    
    tabs.push({ id, label: buttonText, href });
});

const galleries = {};

// Find all panels
$('.py-4.py-lg-5').each((i, el) => {
    const $panel = $(el);
    // get class bindings like :class="{'d-none': $store.inspirations.inspirationtype_id!=4}"
    const classBind = $panel.attr(':class');
    const match = classBind ? classBind.match(/!=(\d+)/) : null;
    const categoryId = match ? parseInt(match[1]) : null;
    
    if (categoryId !== null) {
        galleries[categoryId] = [];
        $panel.find('.inspiration').each((j, insp) => {
            const $insp = $(insp);
            const imgSrc = $insp.find('img').attr('src');
            const dataSrc = $insp.find('a.card-link').attr('data-src'); // usually high res
            const subHtml = $insp.find('a.card-link').attr('data-sub-html');
            const name = $insp.find('.name').text().trim();
            const productLink = $insp.find('.link').attr('href');
            
            galleries[categoryId].push({
                image: dataSrc || imgSrc,
                name: name || subHtml,
                productLink
            });
        });
    }
});

fs.writeFileSync('inspirations_data.json', JSON.stringify({ tabs, galleries }, null, 2));
console.log('Extracted to inspirations_data.json');
