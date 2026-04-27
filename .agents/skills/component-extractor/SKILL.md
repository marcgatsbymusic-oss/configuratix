---
name: component-extractor
description: Extracts specific web components (Hero sections, Color pickers) with high precision, localizing all assets and JS logic for a Vite/React environment.
---

# Web Component Extraction Skill

Use this skill when the user needs to replicate a specific UI feature (like the Drutex color selector) into a local project.

## Instructions
1. **Scoped DOM Analysis**: Use the `Browser` tool to identify the container ID for the target feature (e.g., `#colors-section`).
2. **Asset Localization**: 
   - Detect all `<img>`, `<video>`, and `background-image` URLs.
   - Download these files to a local `./public/assets/products/mb-86n-si/` directory.
   - Update all code references to use these local paths.
3. **Logic Extraction**:
   - Inspect event listeners on the color swatches.
   - Extract the mapping of RAL colors to Hex codes/Images.
   - If the window changes color via CSS filter or background-color, capture the specific CSS classes.
4. **Hero Video Capture**:
   - Identify the hero `<video>` or iframe.
   - Extract the direct `.mp4` source if available to avoid inconsistent external links.
5. **Component Generation**:
   - Generate a single-file React/Svelte component that encapsulates the HTML, CSS (Tailwind or scoped CSS), and the color-switching State logic.

## Constraints
- DO NOT use external CDNs for images; download them.
- DO NOT use relative paths from the source site (e.g., `/images/logo.png`); convert them to absolute local paths.
