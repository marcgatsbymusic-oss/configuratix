import React from "react";

/**
 * WindowConfigSummaryCard
 * -------------------------------------------------------------
 * Summary card for a single window/room configuration in the
 * Mammut configurator (profile, glazing, handle, treatments,
 * colors, complements, energy rating, and delivery info).
 *
 * No external dependencies (icons are inline SVG, styles are
 * scoped inline / in a single <style> block) so it can be
 * dropped into any React setup, with or without Tailwind.
 */

const VARIANT_STYLES: Record<string, { bg: string; text: string }> = {
  neutral: { bg: "#F1EFE8", text: "#444441" },
  solar: { bg: "#FAEEDA", text: "#633806" },
  thermal: { bg: "#FAECE7", text: "#712B13" },
};

const RATING_BAND_COLORS = [
  "#173404",
  "#27500A",
  "#3B6D11",
  "#854F0B",
  "#993C1D",
  "#791F1F",
  "#501313",
];

const RATING_BAND_WEIGHTS = [1.4, 1.2, 1, 0.9, 0.8, 0.7, 0.6];

function IconLayers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

function IconRuler(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.3 15.3-6.6 6.6a1 1 0 0 1-1.4 0L2.1 10.7a1 1 0 0 1 0-1.4l6.6-6.6a1 1 0 0 1 1.4 0l11.2 11.2a1 1 0 0 1 0 1.4Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  );
}

function IconGlass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M3 15h18" />
    </svg>
  );
}

function IconHandle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 12h8" />
      <path d="M8 12a4 4 0 0 1 4-4h4" />
      <circle cx="8" cy="12" r="2" />
    </svg>
  );
}

function IconSun(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function IconLock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

function IconCube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
      <path d="M3 7l9 5 9-5M12 22V12" />
    </svg>
  );
}

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export interface WindowColor {
  label: string;
  hex: string;
}

export interface WindowComplement {
  label: string;
  included: boolean;
  variant: string;
}

export interface WindowConfigSummaryCardProps {
  roomIndex?: number;
  roomName?: string;
  profileCode?: string;
  profileType?: string;
  dimensionsLocked?: boolean;
  dimensionsNote?: string;
  dimensionsValue?: string | null;
  glazing?: string;
  handle?: string;
  treatments?: string;
  colors?: WindowColor[];
  complements?: WindowComplement[];
  efficiencyRating?: string;
  uwValue?: string;
  manufacturingDays?: number;
  deliveryDate?: string | null;
  onViewAR?: (() => void) | null;
  onDelete?: (() => void) | null;
  thumbnail?: React.ReactNode;
}

export default function WindowConfigSummaryCard({
  roomIndex = 1,
  roomName = "Habitación principal",
  profileCode = "IGLO 5",
  profileType = "F252",
  dimensionsLocked = true,
  dimensionsNote = "Fijo por habitación",
  dimensionsValue = null,
  glazing = "3-40 triple, 40mm",
  handle = "Estándar (blanco)",
  treatments = "Solar y térmico",
  colors = [],
  complements = [],
  efficiencyRating = "A++",
  uwValue = "0.74 W/m²K",
  manufacturingDays = 5,
  deliveryDate = null,
  onViewAR = null,
  onDelete = null,
  thumbnail = null,
}: WindowConfigSummaryCardProps) {
  const specs = [
    { icon: IconLayers, label: "Perfil", node: <span style={styles.specValueAccent}>{profileCode} {profileType}</span> },
    {
      icon: IconRuler,
      label: "Dimensiones",
      node: dimensionsLocked ? (
        <span style={styles.lockedRow}>
          <IconLock style={{ color: "#888780" }} />
          <span style={styles.dimNote}>{dimensionsNote}</span>
        </span>
      ) : (
        <span style={styles.specValue}>{dimensionsValue}</span>
      ),
    },
    { icon: IconGlass, label: "Acristalamiento", node: <span style={styles.specValue}>{glazing}</span> },
    { icon: IconHandle, label: "Manilla", node: <span style={styles.specValue}>{handle}</span> },
    { icon: IconSun, label: "Tratamientos", node: <span style={styles.specValue}>{treatments}</span> },
  ];

  return (
    <div style={{ ...styles.outer, position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {thumbnail && (
        <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', background: '#fff', position: 'relative' }}>
          {thumbnail}
          {onViewAR && (
            <button style={{ ...styles.arButton, position: 'absolute', bottom: 12, right: 12, zIndex: 20 }} onClick={onViewAR} type="button">
              <IconCube />
              Ver en RA
            </button>
          )}
        </div>
      )}
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.badge}>{roomIndex}</div>
            <span style={styles.roomName}>{roomName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={styles.profileTag}>{profileCode} · {profileType}</span>
            {onDelete && (
              <button 
                onClick={onDelete} 
                style={{ color: '#888780', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}
                title="Eliminar ventana"
              >
                <IconTrash />
              </button>
            )}
          </div>
        </div>

        <div style={styles.specGrid}>
          {specs.map((s, i) => (
            <div key={i}>
              <div style={styles.specLabel}>
                <s.icon style={{ flexShrink: 0 }} />
                {s.label}
              </div>
              {s.node}
            </div>
          ))}
        </div>

        {colors.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Colores</div>
            <div style={styles.colorGrid}>
              {colors.map((c, i) => (
                <div key={i} style={styles.colorRow}>
                  <span
                    style={{
                      ...styles.swatch,
                      background: c.hex,
                      border: isLight(c.hex) ? "0.5px solid #b4b2a9" : "none",
                    }}
                  />
                  <div>
                    <div style={styles.colorLabel}>{c.label}</div>
                    <div style={styles.colorHex}>{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {complements.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Complementos</div>
            <div style={styles.chipRow}>
              {complements
                .filter((c) => c.included)
                .map((c, i) => {
                  const v = VARIANT_STYLES[c.variant] || VARIANT_STYLES.neutral;
                  return (
                    <span key={i} style={{ ...styles.chip, background: v.bg, color: v.text }}>
                      <IconCheck />
                      {c.label}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        <div style={{ ...styles.section, ...styles.efficiencyRow }}>
          <div>
            <div style={styles.sectionLabel}>Eficiencia de la ventana</div>
            <div style={styles.efficiencyValues}>
              <span style={styles.ratingText}>{efficiencyRating}</span>
              <span style={styles.uwText}>valor Uw {uwValue}</span>
            </div>
          </div>
          <div style={styles.ratingBar}>
            {RATING_BAND_COLORS.map((color, i) => (
              <div key={i} style={{ flex: RATING_BAND_WEIGHTS[i], background: color }} />
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.footerMeta}>
            {manufacturingDays != null && <>Fabricación {manufacturingDays} días</>}
            {manufacturingDays != null && deliveryDate && " · "}
            {deliveryDate && <>entrega estimada {deliveryDate}</>}
          </div>
          {!thumbnail && onViewAR && (
            <button style={styles.arButton} onClick={onViewAR} type="button">
              <IconCube />
              Ver en RA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function isLight(hex: string) {
  if (!hex || hex[0] !== "#" || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 235;
}

const styles: Record<string, React.CSSProperties> = {
  outer: {
    background: "#EDEBE3",
    borderRadius: 12,
    padding: 20,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #E4E2D8",
    padding: "20px 24px",
    color: "#2C2C2A",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#E6F1FB",
    color: "#0C447C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  roomName: { fontSize: 16, fontWeight: 600 },
  profileTag: {
    fontSize: 12,
    color: "#5F5E5A",
    background: "#F1EFE8",
    padding: "4px 10px",
    borderRadius: 8,
  },
  specGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 16,
    paddingBottom: 18,
    borderBottom: "1px solid #EDEBE3",
  },
  specLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#888780",
    marginBottom: 4,
  },
  specValue: { fontSize: 14, fontWeight: 600 },
  specValueAccent: { fontSize: 14, fontWeight: 600, color: "#185FA5" },
  lockedRow: { display: "flex", alignItems: "center", gap: 6 },
  dimNote: { fontSize: 13, color: "#5F5E5A" },
  section: { padding: "18px 0", borderBottom: "1px solid #EDEBE3" },
  sectionLabel: { fontSize: 12, color: "#888780", marginBottom: 10 },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: 14,
  },
  colorRow: { display: "flex", alignItems: "center", gap: 8 },
  swatch: { width: 22, height: 22, borderRadius: "50%", flexShrink: 0 },
  colorLabel: { fontSize: 12, fontWeight: 600 },
  colorHex: { fontSize: 11, color: "#888780" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 20,
  },
  efficiencyRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  efficiencyValues: { display: "flex", alignItems: "baseline", gap: 10 },
  ratingText: { fontSize: 26, fontWeight: 700, color: "#173404" },
  uwText: { fontSize: 13, color: "#5F5E5A" },
  ratingBar: {
    display: "flex",
    height: 22,
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
    minWidth: 180,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    flexWrap: "wrap",
    gap: 12,
  },
  footerMeta: { fontSize: 12, color: "#5F5E5A" },
  arButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: "#2C2C2A",
    background: "#ffffff",
    border: "1px solid #B4B2A9",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
  },
};
