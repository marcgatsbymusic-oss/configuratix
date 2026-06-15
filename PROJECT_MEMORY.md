# Project Memory

This file serves as a state anchor for the project.

## Log

- **2026-03-25T11:00:39+01:00**: Initialized project memory and configured aggressive persistence.
- **2026-04-22**: Investigated Cantor database mapping for glass configurations. Extracted thickness limits from `CUSTOM_OKNA_PODKLADKI` and single pane options from `CUSTOM_SZYBY`. Created artifacts mapping double/triple/quadruple glass packages to profiles (IG5, IGP, BRG) and categorizing individual glass panes (FL, T, B, etc.) for UI dropdown implementation.
- **2026-05-24**: Successfully integrated the 12-component geometry mapping and gasket rendering for profile typology F103. Resolved canvas collapses (flex layout conflicts) and OrbitControls target resets (camera angle locks). Created a complete integration guide at `docs/f103_geometry_integration_guide.md`, committed changes, and deployed to production on Vercel (https://configuratix-kohl.vercel.app).
- **2026-06-09**: Imported bottom-right window hinge GLB and created the `/hinge-tester` interactive page. Programmed a 2-DOF dynamic rigging model (tilting and swinging joints) that corrects the CAD parent-child collision (where the bottom pin protruded through the cover cap during opening). Archived conversation logs and artifacts to `docs/sessions/23ebf157-1b9c-401c-ad32-a17e99af8fad/`.
