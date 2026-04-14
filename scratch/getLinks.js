fetch('https://www.drutex.eu/en/')
  .then(r=>r.text())
  .then(t => { 
     const links = t.match(/href="[^"]*products\/(?:windows|doors)[^"]*"/gi) || []; 
     console.log([...new Set(links)]); 
  })
  .catch(console.error);
