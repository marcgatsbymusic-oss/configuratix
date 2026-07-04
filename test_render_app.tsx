import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App';

try {
  const html = renderToString(<App />);
  console.log("Rendered successfully! Length:", html.length);
} catch (e) {
  console.error("Crash during render!", e);
}
