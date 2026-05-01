import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const html = fs.readFileSync('scratch/iglo5doors.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

const data = {
  heroVideo: '',
  inlineVideo: '',
  standardEquipment: [],
  specs: [],
  features: [],
  heroImage: '',
  profileImage: '',
};

// Find mp4 links
const videos = Array.from(document.querySelectorAll('video source')).map(s => s.src);
data.videos = videos;

// Standard equipment
const eqElements = document.querySelectorAll('.drx-wysiwyg ul li, .standard-equipment ul li, .equipment-list li');
if(eqElements.length > 0) {
    data.standardEquipment = Array.from(eqElements).map(el => el.textContent.trim());
}

// Any lists that might be equipment
const lists = Array.from(document.querySelectorAll('ul.list-unstyled li, ul.check-list li')).map(el => el.textContent.trim());
data.otherLists = lists;

// text content
data.textContent = Array.from(document.querySelectorAll('.drx-wysiwyg p, .description p')).map(el => el.textContent.trim()).filter(t => t.length > 20);

// Specs
const specElements = document.querySelectorAll('.t-product-parameters .t-item, .spec-item, .parameter-box');
data.specs = Array.from(specElements).map(el => {
  return el.textContent.trim().replace(/\s+/g, ' ');
});

// Any raw texts that match "Uw ="
const rawText = document.body.textContent;
data.uw = rawText.match(/Uw\s*=\s*[\d,.]+\s*W\/\(m2K\)/g);

// Images
data.images = Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('produkty/'));

console.log(JSON.stringify(data, null, 2));
