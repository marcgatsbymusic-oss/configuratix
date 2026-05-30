async function check() {
  try {
    const res = await fetch('http://localhost:5173/assets/windowtypes/F100.jpg');
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
    const buf = await res.arrayBuffer();
    console.log('Buffer byteLength:', buf.byteLength);
    // Print first 10 hex bytes
    const bytes = new Uint8Array(buf.slice(0, 10));
    console.log('First 10 bytes (hex):', Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' '));
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

check();
