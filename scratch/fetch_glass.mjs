import https from 'https';

https.get('https://www.drutex.eu/en/products/iglo-edge.html', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const glassesSection = data.substring(data.indexOf('id="glasses"'), data.indexOf('id="addons"'));
    const names = glassesSection.match(/<h3[^>]*>([^<]+)<\/h3>/g);
    if(names) {
      console.log(names.map(n => n.replace(/<\/?h3[^>]*>/g, '').trim()));
    } else {
      console.log("No h3 found. Raw text around glass items:", glassesSection.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 1000));
    }
  });
});
