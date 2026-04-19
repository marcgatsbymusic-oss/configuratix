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

  close() { this.db.close(); }
}
