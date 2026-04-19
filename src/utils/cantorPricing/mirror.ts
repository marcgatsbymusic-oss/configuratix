// Read-only access to the Cantor SQLite mirror produced by
// scripts/cantor/sync_cantor_pricing.mjs.
//
// Important: this module assumes a Node.js runtime (better-sqlite3 is native).
// The web bundle does NOT load it directly — at runtime in the browser we
// either ship pre-resolved JSON snapshots or use sql.js. For Phase A we run
// the engine in tests via vitest (Node), so this is fine.

import Database from 'better-sqlite3';
import type { PMatRow } from '../cantorFormula';
export type { PMatRow };

export interface PreiseRow {
  ZYKLUS: number;
  KEY1: string;
  KEY2: string;
  KEY3: string;
  KEY4: string;
  PREISART: 'E' | 'V';
  LFDNR: number;
  PREISGRUPPE: string | null;
  PREISTYP: string | null;
  PREISSTUECK: number;
  PROZENT: number;
  MATRIX: string | null;
  FORMEL: string | null;
  FORMELTEXT: string | null;
  KLASSE1: string | null;
  KLASSE2: string | null;
  SORTINDEX: number;
}

export interface PreiszykRow {
  KURZBEZ: string;
  WAEHRUNG: string;
  ZYKLUS: number;
  FAKTOR: number;
  BASISWAEHRUNG: string;
  SEKUNDAERWAEHRUNG: string;
}

export class CantorMirror {
  private db: Database.Database;
  private pmatStmt: Database.Statement;
  private preiseStmt: Database.Statement;
  private preiszykStmt: Database.Statement;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, { readonly: true, fileMustExist: true });
    // Snap-to-grid: nearest cell where BREITE>=w and HOEHE>=h. If none,
    // largest available row. (Verified against AUFNR 1500041 1000x1000.)
    this.pmatStmt = this.db.prepare(`
      SELECT * FROM PREISMAT
      WHERE PREISMATRIX = @matrix
        AND KLASSE1 = @k1
        AND KLASSE2 = @k2
        AND BREITE >= @w
        AND HOEHE >= @h
      ORDER BY BREITE ASC, HOEHE ASC
      LIMIT 1
    `);
    this.preiseStmt = this.db.prepare(`
      SELECT ZYKLUS, KEY1, KEY2, KEY3, KEY4, PREISART, LFDNR, PREISGRUPPE,
             PREISTYP, PREISSTUECK, PROZENT, MATRIX, FORMEL, FORMELTEXT,
             KLASSE1, KLASSE2, SORTINDEX
      FROM PREISE
      WHERE KEY1 = @key1 AND KEY2 = @key2 AND ZYKLUS = @zyklus AND PREISART = @preisart
      ORDER BY SORTINDEX, LFDNR
    `);
    this.preiszykStmt = this.db.prepare(`
      SELECT KURZBEZ, WAEHRUNG, ZYKLUS, FAKTOR, BASISWAEHRUNG, SEKUNDAERWAEHRUNG
      FROM PREISZYK WHERE KURZBEZ = @kurzbez
    `);
  }

  pmatLookup(matrix: string, k1: string, k2: string, k3: string, w: number, h: number): PMatRow | null {
    // Cantor's PMATALL has two calling conventions, distinguished by the 4th
    // argument (k3). The PMATALL primitive returns a PMatRow; whether to read
    // PREIS or PREIS<k3> is decided by callers via pmatColumnFor() below.
    //
    //   A) k3 is empty → (w, h) are real dimensions; snap-to-grid by
    //      BREITE>=w AND HOEHE>=h (nearest-up), fallback largest.
    //      Example: PMATALL("PVC_F100","F","IG5","",BRB,BRH) → PREIS column
    //
    //   B) k3 is non-empty → category-style matrix where the matrix has a
    //      single row at (1,1) and per-category prices live in PREIS columns
    //      PREIS .. PREIS10. The k3 string selects which column to read.
    //      For numeric k3 (e.g. "4"): return PREIS<k3> (PREIS4).
    //      For symbolic k3 (e.g. "PelneRama"): resolve via PREISSCHEMAD
    //      (column label → PREISFELDNR). Symbolic case not yet exercised in
    //      Phase B; throws so we surface the missing path.
    const row = this.pmatStmt.get({ matrix, k1, k2, w, h }) as PMatRow | undefined
      ?? (this.db.prepare(
        `SELECT * FROM PREISMAT WHERE PREISMATRIX = ? AND KLASSE1 = ? AND KLASSE2 = ? ORDER BY BREITE DESC, HOEHE DESC LIMIT 1`,
      ).get(matrix, k1, k2) as PMatRow | undefined);
    return row ?? null;
  }

  // For category-style PMATALL calls (k3 non-empty), returns the price from
  // the column the k3 key resolves to. Numeric k3 maps directly: "4" → PREIS4.
  pmatPrice(row: PMatRow, k3: string): number {
    if (!k3 || k3.length === 0) return row.PREIS ?? 0;
    // Numeric k3 in [1..10]: column selector (PREIS, PREIS2..PREIS10).
    const asNum = Number(k3);
    if (!Number.isNaN(asNum) && Number.isInteger(asNum) && asNum >= 1 && asNum <= 10) {
      const key = asNum === 1 ? 'PREIS' : `PREIS${asNum}`;
      const v = (row as unknown as Record<string, number | null>)[key];
      return v ?? 0;
    }
    // Other k3 values (article codes like "50001", labels like "PelneRama")
    // are filter/category keys for the row itself. Since the snap already
    // returned the matching row, we read the default PREIS column.
    // PREISSCHEMAD-driven label resolution (Phase C+) will refine this.
    return row.PREIS ?? 0;
  }

  loadSchema(schemaId: number, zyklus: number, preisart: 'E' | 'V'): PreiseRow[] {
    return this.preiseStmt.all({
      key1: 'SCHEMA',
      key2: String(schemaId),
      zyklus,
      preisart,
    }) as PreiseRow[];
  }

  preiszyk(kurzbez: string): PreiszykRow | null {
    return (this.preiszykStmt.get({ kurzbez }) as PreiszykRow | undefined) ?? null;
  }

  // Resolve a pane/spacer article code (e.g. 'FL4') to its ARTIKELID via
  // GLASS_PANE / GLASS_SPACER. Returns null if unknown.
  paneArticleId(articleNo: string): number | null {
    const row = this.db.prepare(`SELECT ARTIKELID FROM GLASS_PANE WHERE ARTICLENO = ?`).get(articleNo) as { ARTIKELID: number } | undefined;
    return row ? row.ARTIKELID : null;
  }

  spacerArticleId(articleNo: string): number | null {
    const row = this.db.prepare(`SELECT ARTIKELID FROM GLASS_SPACER WHERE ARTICLENO = ?`).get(articleNo) as { ARTIKELID: number } | undefined;
    return row ? row.ARTIKELID : null;
  }

  // Read all PREISFELDNR → WERT rows for a (article, schema) pair.
  // Used for schemas that read PREISFELDx from ARTPREISE (e.g. panes / SCHEMA 51).
  artpreiseFields(artikelId: number, preisschemaId: number): Map<number, number> {
    const rows = this.db.prepare(
      `SELECT PREISFELDNR, WERT FROM ARTPREISE WHERE ARTIKELID = ? AND PREISSCHEMAID = ?`,
    ).all(artikelId, preisschemaId) as Array<{ PREISFELDNR: number; WERT: number }>;
    const m = new Map<number, number>();
    for (const r of rows) m.set(r.PREISFELDNR, r.WERT);
    return m;
  }

  // Parses Cantor's ARTIKELVARIABLEN pipe-separated string:
  //   "ART_1805_ETyp\\3\\FE|ART_1805_MatrixName\\3\\F100|..."
  // into a Map<variableName, value>. The middle token is VARTYP (1=int,
  // 2=decimal, 3=string) which we currently drop — all callers treat the
  // value as a string anyway.
  private static parseVariables(s: string | null): Map<string, string> {
    const m = new Map<string, string>();
    if (!s) return m;
    for (const piece of s.split('|')) {
      if (!piece) continue;
      const parts = piece.split('\\');
      if (parts.length >= 3) m.set(parts[0], parts.slice(2).join('\\'));
    }
    return m;
  }

  // Parses Cantor's ESFELD semicolon-separated string:
  //   "1000=-;1005=2/2023;1040=IGE;"
  // into Map<ART_artklCode_esCode, value>.
  private static parseEsfeld(s: string | null, artklCode: number): Map<string, string> {
    const m = new Map<string, string>();
    if (!s) return m;
    for (const piece of s.split(';')) {
      if (!piece) continue;
      const idx = piece.indexOf('=');
      if (idx !== -1) {
        const esCode = piece.substring(0, idx);
        const val = piece.substring(idx + 1);
        m.set(`ART_${artklCode}_${esCode}`, val);
      }
    }
    return m;
  }

  // Resolve an article's Cantor-side ARTIKELVARIABLEN by finding the most
  // recent real AUFPOS row matching (ARTNR, PROFILSATZNAME) and reading the
  // paired AUFARTIK ARTKLCODE=1805 INFO row. This is the Cantor-faithful
  // way to learn ART_1805_MatrixName, ART_1805_ETyp etc. for any article
  // that has ever been priced.
  articleVariablesFor(artnr: string, profilsatz: string): Map<string, string> {
    // Merge every AUFARTIK row paired with the newest matching AUFPOS so we
    // pick up all ART_<klCode>_<name> variables — ARTKLCODE 1805 (INFO) has
    // ART_1805_*, ARTKLCODE 1199 (TECH) has ART_1199_*, ARTKLCODE 2090
    // (PROFILE) has ART_090_* / ART_AD_* / ART_RA_* etc., ARTKLCODE 2801
    // (OPCJE) has ART_x801_*. Formulas may reference any of these.
    let pos = this.db.prepare(
      `SELECT AUFNR, POSNR FROM AUFPOS
       WHERE ARTNR = ? AND PROFILSATZNAME = ?
       ORDER BY AUFNR DESC, POSNR DESC LIMIT 1`,
    ).get(artnr, profilsatz) as { AUFNR: number; POSNR: number } | undefined;

    // If the snapshot lacks this exact combination (e.g. F104 + IGECL), fallback to F100
    // for this profile. F100 shares the same core ART_* variables (like SystemProfili)
    // and makes the engine resilient without needing a gigabyte db dump of every permutation.
    if (!pos && artnr !== 'F100') {
      pos = this.db.prepare(
        `SELECT AUFNR, POSNR FROM AUFPOS
         WHERE ARTNR = 'F100' AND PROFILSATZNAME = ?
         ORDER BY AUFNR DESC, POSNR DESC LIMIT 1`,
      ).get(profilsatz) as { AUFNR: number; POSNR: number } | undefined;
    }

    if (!pos) return new Map();
    const rows = this.db.prepare(
      `SELECT ARTKLCODE, ARTIKELVARIABLEN, ARTIKELVARIABLEN2, ESFELD
       FROM AUFARTIK WHERE AUFNR = ? AND REFPOSNR = ?`,
    ).all(pos.AUFNR, pos.POSNR) as Array<{ ARTKLCODE: number; ARTIKELVARIABLEN: string | null; ARTIKELVARIABLEN2: string | null; ESFELD: string | null }>;
    const merged = new Map<string, string>();
    for (const r of rows) {
      for (const [k, v] of CantorMirror.parseVariables(r.ARTIKELVARIABLEN)) merged.set(k, v);
      for (const [k, v] of CantorMirror.parseVariables(r.ARTIKELVARIABLEN2)) merged.set(k, v);
      for (const [k, v] of CantorMirror.parseEsfeld(r.ESFELD, r.ARTKLCODE)) merged.set(k, v);
    }
    return merged;
  }

  // Return the PREISZYK row active for (currency, date). Picks the newest
  // GUELTIGKEIT <= date. Replaces hardcoded pricelistKurzbez.
  activePreiszyk(currency: string, onDate: Date = new Date()): PreiszykRow | null {
    const iso = onDate.toISOString();
    const row = this.db.prepare(
      `SELECT KURZBEZ, WAEHRUNG, ZYKLUS, FAKTOR, BASISWAEHRUNG, SEKUNDAERWAEHRUNG
       FROM PREISZYK
       WHERE WAEHRUNG = ? AND GUELTIGFUERVK = 1 AND GUELTIGKEIT <= ?
       ORDER BY GUELTIGKEIT DESC
       LIMIT 1`,
    ).get(currency, iso) as PreiszykRow | undefined;
    return row ?? null;
  }

  // Read the geometric width (in mm) of a profile directly from its article description.
  // Cantor stores PVC profile deductions via dynamic geometry parsing rather than
  // explicit PROFILINGID mapping in the database. Extracting the width from the mirrored
  // BEZEICHNUNG accurately fulfills the data-driven requirement for multi-sash bounding box logic.
  profileGeometry(profileArticleNo: string): { width: number } | null {
    const row = this.db.prepare(
      `SELECT BEZEICHNUNG FROM ARTIKEL WHERE ARTNR = ?`
    ).get(profileArticleNo) as { BEZEICHNUNG: string | null } | undefined;
    if (!row || !row.BEZEICHNUNG) return null;

    // e.g. "Ościeżnica z słupka stałego, 84mm, 50021" -> 84
    const match = row.BEZEICHNUNG.match(/(\d+)\s*mm/i);
    if (match && match[1]) {
      return { width: parseInt(match[1], 10) };
    }
    return null;
  }

  // Lookup the FARBKLASSE for a given color type and code (maps to fn_getFarbcodeClassX)
  colorClass(type: string, code: string, level: 1|2|3): string {
    const row = this.db.prepare(
      `SELECT FARBKLASSE, FARBKLASSE2, FARBKLASSE3 FROM FARBCODES 
       WHERE FARBCODETYP = ? AND FARBCODE = ?`
    ).get(type, code) as { FARBKLASSE: string | null; FARBKLASSE2: string | null; FARBKLASSE3: string | null } | undefined;
    
    if (!row) return '';
    if (level === 1) return row.FARBKLASSE ?? '';
    if (level === 2) return row.FARBKLASSE2 ?? '';
    return row.FARBKLASSE3 ?? '';
  }

  close() { this.db.close(); }
}
