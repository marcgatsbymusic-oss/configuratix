import React from 'react';
import { renderToString } from 'react-dom/server';
import { MainConfigurator } from './src/components/SlateConfigurator/MainConfigurator';

try {
  const html = renderToString(React.createElement(MainConfigurator));
  console.log("Render successful!");
} catch (error) {
  console.error("Render failed:", error);
}
