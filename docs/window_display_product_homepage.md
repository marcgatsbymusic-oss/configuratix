# Product Display & Homepage Style Guide

This document outlines the standardized layout, styling patterns, and component structure used to build high-converting, visually striking product detail pages across the Mammut Drutex platform.

These guidelines are derived from the successful implementation of the **Iglo Energy** and **Iglo Edge** product pages.

---

## 1. Hero Section

The hero section serves as the first impression. It must be immersive and clearly convey the product's primary technical specifications immediately.

### Layout & Background
- **Wrapper**: `min-h-[600px] h-[80vh] relative overflow-hidden flex items-end`
- **Background Media**: Use an `<video>` or `<img />` tag set to `absolute inset-0 w-full h-full object-cover z-0 opacity-60`.
- **Overlay**: Use a gradient overlay to ensure text readability: `bg-gradient-to-t from-[#111112] via-transparent to-[#111112]/50`.

### Typography
- **H1 Title**: `text-4xl md:text-5xl font-bold tracking-widest uppercase mb-3 text-white`
- **Tagline/Subheading**: `text-xl md:text-2xl font-light mb-10 tracking-wider text-white`

### Technical Specifications Grid
A responsive grid located at the bottom of the hero section displaying key metrics (Uw, dB, Chambers).
- **Structure**: `grid grid-cols-2 md:grid-cols-6 gap-6`
- **Card Styling (Option A - Solid Gold Left Border)**: `border-l-2 border-mammut-gold pl-4 py-2 bg-mammut-black/40 backdrop-blur-md rounded-r-xl`
- **Card Styling (Option B - Interrupted Border Box)**: A custom box utilizing pseudo-elements or absolute positioned strips to create "gaps" in the top and bottom borders, rendering a highly technical, blueprint-like aesthetic.

---

## 2. Theme Handling (Crucial)

To ensure the product showcases maintain a clean, premium, architectural feel, the content sections *below* the hero section must utilize a **forced light theme**, regardless of the user's global Day/Night mode preference.

Because standard Tailwind utility classes (`bg-white`, `text-black`, `bg-gray-50`) map dynamically to CSS variables that invert during a theme switch, you **MUST** use arbitrary hex values for these sections:

- **Primary Background**: `bg-[#ffffff]` (Do not use `bg-white`)
- **Secondary/Accent Background**: `bg-[#f9fafb]` (Do not use `bg-gray-50`)
- **Primary Text**: `text-[#000000]` (Do not use `text-black`)
- **Muted Text**: `text-[#4b5563]` or `text-[#6b7280]`
- **Borders**: `border-[#e5e7eb]`

---

## 3. Core Page Layout Strategies

Depending on the depth of the product, use one of two established layout patterns:

### Pattern A: Scroll-Spy with Sticky Sidebar (e.g., Iglo Energy)
Ideal for products with distinct, varied sections.
- **Sidebar (`aside`)**: Fixed width (`w-72`), sticky (`sticky top-28`). Contains anchor links mapped to custom SVG icons from `ProductIcons.tsx`.
- **Main Content**: A scrolling flex container. Sections utilize `scroll-mt-24` to offset the fixed top header when navigating via anchor links.

### Pattern B: Stacked Full-Width Sections (e.g., Iglo Edge)
Ideal for products relying heavily on large imagery and structured catalogs.
- **Container**: `max-w-7xl mx-auto px-6` centered within full-width background sections.
- **Dividers**: Distinct horizontal breaks using `border-b border-[#e5e7eb]`.

---

## 4. Reusable Section Components

### Overview & Description
- Two-column layout (`grid lg:grid-cols-2 gap-16`).
- **Left Column**: Marketing copy, standard equipment bullet points (with gold checkmarks), and an interactive CTA button to view a video.
- **Right Column**: Embedded video or a 3D flip card (`perspective: '1200px'`) that rotates on hover to reveal technical blueprints.

### Glazing Options (`GlazingSection`)
- Two-column layout.
- **Left**: Grid of small thumbnail buttons (`grid-cols-4`). Active state indicated by a gold border (`border-[#eab676]`).
- **Right**: Large, high-resolution preview of the selected glass pane (`min-h-[400px] max-h-[560px]`).

### Interactive Color Swatches
- Utilizes the `ColorSwatch` component.
- Displayed alongside a dynamic window frame rendering that updates its hue based on the selected Renolit foil.
- **Full-width Color Banner**: A programmatic banner spanning the full width of the screen, utilizing the selected color's hex code or texture image as its background.

### Product Accessories (Sliders)
- Used for Handles and Ventilation/Mounting options.
- Carousel implementation showing a set number of items per page (e.g., 5 for handles, 3 for accessories).
- Custom pagination dots and chevron navigation buttons styled with muted borders that turn gold on hover.

---

## 5. Floating Action Bar (CTA)

A sticky bar positioned at the bottom of the viewport to drive conversions.

- **Wrapper**: `fixed bottom-0 left-0 right-0 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#e5e7eb] p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]`
- **Content**: Displays the product name and currently selected color.
- **Action**: A prominent "Configure Quote" button (`bg-mammut-gold text-[#000000] px-8 py-3 uppercase font-bold tracking-widest`) that routes the user to the `/configurator` with the appropriate URL parameters (`?product=...&color=...`).
