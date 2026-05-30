async function run() {
  for (const name of ['F100.jpg', 'F101.jpg', 'F103.jpg', 'F104.jpg', 'F105.jpg']) {
    try {
      const res = await fetch(`http://localhost:5173/assets/windowtypes/${name}`);
      console.log(`${name}: Status: ${res.status}, size: ${res.headers.get('content-length')}`);
    } catch (err) {
      console.error(`Error fetching ${name}:`, err);
    }
  }
}
run();
