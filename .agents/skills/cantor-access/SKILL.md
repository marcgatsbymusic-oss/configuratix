---
name: cantor-access
description: Extracts product rules, pricing logic, and reference data from the local A+W Cantor SQL Database (DRUTEX_DEALER) to map to the web configurator.
---

# Cantor Database Access Skill

This skill provides the standard operating procedure for querying and extracting configuration data from the local Cantor SQL Server database. The goal is to programmatically fetch available profiles, color codes, glass types, dimension bounds, and formulas so they can be mapped into the web configurator's JSON schema.

## When to use this skill
- The user wants to "harvest reference data" or "extract configuration rules" from Cantor.
- When validating if a specific color, profile, or dimension is supported by Drutex.
- When you need to sync the web configurator logic with Cantor.

## Configuration Details
- **Server:** `localhost\CANTOR2019`
- **Database:** `DRUTEX_DEALER`
- **Auth:** Trusted Connection (Windows Authentication)
- **Node Driver:** `mssql/msnodesqlv8.js`

## How to use it

This skill includes a helper script to execute SQL queries directly from the workspace terminal:
**Path:** `.agents/skills/cantor-access/scripts/queryCantor.mjs`

You can run a query string directly:
```bash
node .agents/skills/cantor-access/scripts/queryCantor.mjs "SELECT TOP 10 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
```

Or run a `.sql` file:
```bash
node .agents/skills/cantor-access/scripts/queryCantor.mjs myquery.sql > output.json
```

**Workflow for Extracting Data:**
1. **Discover Tables:** Use `INFORMATION_SCHEMA.TABLES` and `INFORMATION_SCHEMA.COLUMNS` to navigate the poorly-documented ERP schema. Use keywords in your `LIKE` clauses (e.g., `'%PARTIKEL%'`, `'%FARB%'`, `'%RESTRIKTION%'`, `'%PREIS%'`).
2. **Sample Data:** Always `SELECT TOP 5 *` from an unknown table before extracting the full set, as ERP tables can contain millions of rows.
3. **Map to Configurator Schema:** Convert the flat and complex Cantor SQL results into clean, hierarchical JSON tailored for the React web configurator. Save these outputs to the `scripts/` or `src/data/` directories in the workspace.

### Schema Analysis
If you need to analyze the database structure, refer to the generated schema map located at:
**Resource Path:** `.agents/skills/cantor-access/resources/cantor_db_map.md`

You can also regenerate this schema map at any time (e.g., to capture new tables) by running the generator script:
```bash
node .agents/skills/cantor-access/scripts/generate_db_map.mjs
```
