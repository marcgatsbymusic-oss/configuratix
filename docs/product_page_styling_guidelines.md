# Product Page Styling Guidelines

This document outlines the strict UI/UX guidelines for styling product details pages (e.g., `ProductDetailPage.tsx`) to maintain brand consistency and optimal readability. 

These rules were established after refining the "Iglo Edge" product layout and must be applied to all future product pages.

## 1. The "Split Theme" Layout
Product pages follow a distinct two-part theme layout:
- **Hero Section (Top):** Strictly **Dark Mode**.
- **Content Sections (Below Hero):** Strictly **Light Mode**.

### 1.1 Hero Section
The hero section must feel premium and cinematic.
- **Background:** Dark or video background (`bg-mammut-black`, `bg-mammut-darker`).
- **Text:** White (`text-mammut-white`).
- **Typography Overrides:** Avoid using `!important` in the global `index.css` for hero text elements unless absolutely necessary, as it severely breaks inheritance when those classes are reused elsewhere.
- **Gradients:** If fading out of the hero section into the content section, use a sharp cutoff or a gradient that cleanly separates the dark top from the white bottom.

### 1.2 Content Sections
All sections beneath the hero (Overview, Profile Specs, Glass, Handles, Colors, Additional Options) must be rendered in pure Light Mode for maximum readability.
- **Backgrounds:** Use pure white (`bg-white`). Do **NOT** use light grays (`bg-gray-50` or `bg-gray-100`) as background panels.
- **Text:** Use black (`text-black`) for primary headings and dark gray (`text-gray-600`) for paragraphs and descriptions. Do **NOT** use light grays (`text-gray-400` or `text-gray-500`) for small text, as it fails accessibility contrast ratios on white backgrounds.
- **Borders:** Use standard gray borders (`border-gray-200`) instead of dark borders (`border-mammut-border`).
- **Translucency:** Avoid white opacity filters (`rgba(255,255,255,0.6)`) on light backgrounds. Always invert them to dark opacity filters (`rgba(0,0,0,0.6)`).

## 2. Common Pitfalls & Anti-Patterns
When building new product templates, watch out for these common errors:

1. **Global CSS Conflicts:** Never apply `color: #ffffff !important;` to paragraph classes (e.g., `.product-overview-description`) in `index.css`. If this class is used in a white-background section, the text will become invisible.
2. **Hardcoded Dark Mode Classes:** When extracting reusable components (like `<HandlesSlider />` or `<ColorSwatch />`), do not hardcode `bg-mammut-darker` or `text-mammut-white` into them if they are going to be placed in the white-background content area. 
3. **Hover States:** Ensure hover states also provide good contrast. A dark border turning into `border-white/10` on hover will vanish on a white background. Change it to `border-black/10`.

## 3. Reference Implementation
The canonical reference for this styling architecture is `src/pages/ProductDetailPage.tsx`. Any new product pages should duplicate its layout structure and tailwind class combinations.
