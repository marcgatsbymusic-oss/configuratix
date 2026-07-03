/**
 * F202Page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Route: /f202
 * Window: F202 — Okno 2 kw. słupek ruchomy  (IGLO 5)
 *
 * 2-field double casement with movable mullion (stulp ruchomy 50029):
 *   Left field  → TURN,      passive, hinge=LEFT
 *   Right field → TILT_TURN, active,  hinge=RIGHT, handle=LEFT
 *
 * Profiles (from saturday_27_14_37 seed / profiles.json):
 *   Frame:        50001 · rama 66mm
 *   Sash L:       50034 · skrzydło 120mm N_Z
 *   Sash R:       50031 · skrzydło 105mm D_W
 *   Movable post: 50029 · słupek ruchomy
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, Suspense } from 'react';
import { F202Viewer } from '../components/configurator/F202Viewer';

// ── Colour palettes ────────────────────────────────────────────────────────────
const EXT_COLORS = [
  { label: 'White',       hex: '#f2f0ec', id: 'white'      },
  { label: 'Anthracite',  hex: '#2d3035', id: 'anthracite' },
  { label: 'Graphite',    hex: '#3e4045', id: 'graphite'   },
  { label: 'Golden Oak',  hex: '#8B5E2E', id: 'oak'        },
  { label: 'Steel Blue',  hex: '#3b5278', id: 'steel'      },
  { label: 'Dark Green',  hex: '#2c4a34', id: 'dkgreen'    },
  { label: 'Dark Brown',  hex: '#4a2c1a', id: 'brown'      },
  { label: 'Black',       hex: '#1a1a1a', id: 'black'      },
  { label: 'Cream',       hex: '#fdf5e4', id: 'cream'      },
  { label: 'Dune',        hex: '#c4a882', id: 'dune'       },
];

const INT_COLORS = [
  { label: 'White',       hex: '#f2f0ec', id: 'white'      },
  { label: 'Anthracite',  hex: '#2d3035', id: 'anthracite' },
  { label: 'Oak Decor',   hex: '#c8924c', id: 'oak'        },
  { label: 'Walnut',      hex: '#7a4c28', id: 'walnut'     },
  { label: 'Mahogany',    hex: '#6e2a18', id: 'mahog'      },
  { label: 'Black',       hex: '#1a1a1a', id: 'black'      },
  { label: 'Grey',        hex: '#9ba0a6', id: 'grey'       },
  { label: 'Cream',       hex: '#fdf5e4', id: 'cream'      },
];

const SEAL_COLORS = [
  { label: 'Black', hex: '#1a1a1a' },
  { label: 'Grey',  hex: '#808080' },
  { label: 'White', hex: '#e8e8e8' },
  { label: 'Brown', hex: '#4a2f1a' },
];

// ── Theme ──────────────────────────────────────────────────────────────────────
const GOLD  = '#eab676';
const PANEL = 'rgba(14,16,24,0.82)';
const BDR   = 'rgba(234,182,118,0.18)';

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: GOLD, marginBottom: 8,
    }}>
      {text}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />;
}

function SwatchRow({
  options,
  selectedId,
  onSelect,
}: {
  options: { label: string; hex: string; id: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
          title={o.label}
          style={{
            width: 22, height: 22, borderRadius: 4,
            background: o.hex,
            border: selectedId === o.id
              ? `2px solid ${GOLD}`
              : '2px solid rgba(255,255,255,0.15)',
            cursor: 'pointer', outline: 'none',
            boxShadow: selectedId === o.id ? `0 0 8px ${GOLD}66` : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
      ))}
    </div>
  );
}

function SliderRow({
  label, value, min, max, step = 1,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#9aa0ad' }}>{label}</span>
        <span style={{ fontSize: 10, color: GOLD, fontVariantNumeric: 'tabular-nums' }}>
          {value} mm
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }}
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export const F202Page: React.FC = () => {
  const [width,      setWidth]      = useState(1350);
  const [height,     setHeight]     = useState(1245);
  const [splitRatio, setSplitRatio] = useState(0.5);

  const [extId,  setExtId]  = useState('white');
  const [intId,  setIntId]  = useState('white');
  const [biColor, setBiColor] = useState(false);
  const [sealId,  setSealId]  = useState('black');

  const extColor  = EXT_COLORS.find(c => c.id === extId)!.hex;
  const intColorFull = INT_COLORS.find(c => c.id === intId)!.hex;
  const intColor  = biColor ? intColorFull : extColor;
  const gskColor  = SEAL_COLORS.find(c => c.label.toLowerCase() === sealId)!?.hex ?? '#1a1a1a';

  return (
    <div
      id="f202-page"
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', overflow: 'hidden',
        background: '#0a0b10',
        fontFamily: "'Inter', 'Outfit', sans-serif",
      }}
    >
      {/* ── 3-D Viewport ──────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', flex: 1 }}>
        <Suspense fallback={null}>
          <F202Viewer
            width={width}
            height={height}
            splitRatio={splitRatio}
            colorExt={extColor}
            colorInt={intColor}
            colorGsk={gskColor}
          />
        </Suspense>

        {/* Badge */}
        <div style={{
          position: 'absolute', top: 16, left: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(234,182,118,0.08)',
          border: '1px solid rgba(234,182,118,0.30)',
          color: GOLD, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', backdropFilter: 'blur(12px)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: GOLD, animation: 'pulse 2s infinite',
          }} />
          F202 · IGLO 5 · Okno 2 kw. słupek ruchomy
        </div>

        {/* Field legend */}
        <div style={{
          position: 'absolute', top: 16, right: 312,
          display: 'flex', gap: 8,
          backdropFilter: 'blur(8px)',
        }}>
          {[
            { label: 'L — TURN (passive)', color: '#60a5fa' },
            { label: 'R — TILT-TURN (active)', color: '#fbbf24' },
          ].map(({ label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 6,
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${color}44`,
              color, fontSize: 10, fontWeight: 600,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Interaction hint */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%',
          transform: 'translateX(-50%)',
          padding: '4px 14px', borderRadius: 6,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#9aa0ad', fontSize: 10,
          backdropFilter: 'blur(8px)',
        }}>
          Click the coloured dots on the sashes to open/tilt ·
          Drag to orbit · Scroll to zoom
        </div>
      </div>

      {/* ── Control panel ─────────────────────────────────────────────────── */}
      <div style={{
        width: 288, flexShrink: 0,
        background: PANEL, borderLeft: `1px solid ${BDR}`,
        padding: '20px 16px', overflowY: 'auto',
        backdropFilter: 'blur(24px)',
      }}>
        {/* Title */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e8eaf0', marginBottom: 2 }}>
            F202
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            IGLO 5 · Double Window · Movable Post
          </div>
        </div>

        {/* Dimensions */}
        <SectionLabel text="Dimensions" />
        <SliderRow label="Width"       value={width}  min={600}  max={2400} onChange={setWidth}  />
        <SliderRow label="Height"      value={height} min={400}  max={2400} onChange={setHeight} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#9aa0ad' }}>Split ratio (L / R)</span>
            <span style={{ fontSize: 10, color: GOLD }}>
              {Math.round(splitRatio * 100)} / {Math.round((1 - splitRatio) * 100)} %
            </span>
          </div>
          <input type="range" min={0.25} max={0.75} step={0.01} value={splitRatio}
            onChange={e => setSplitRatio(Number(e.target.value))}
            style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }}
          />
        </div>

        <Divider />

        {/* Exterior colour */}
        <SectionLabel text="Exterior Colour" />
        <SwatchRow options={EXT_COLORS} selectedId={extId} onSelect={setExtId} />
        <div style={{ marginTop: 6, fontSize: 10, color: '#6b7280' }}>
          {EXT_COLORS.find(c => c.id === extId)?.label}
        </div>

        <Divider />

        {/* Bi-colour toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: '#9aa0ad' }}>Bi-colour (different interior)</span>
          <button
            onClick={() => setBiColor(v => !v)}
            style={{
              width: 34, height: 18, borderRadius: 9,
              background: biColor ? GOLD : 'rgba(255,255,255,0.12)',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: biColor ? 17 : 2,
              width: 14, height: 14, borderRadius: 7,
              background: '#fff', transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {biColor && (
          <>
            <SectionLabel text="Interior Colour" />
            <SwatchRow options={INT_COLORS} selectedId={intId} onSelect={setIntId} />
            <div style={{ marginTop: 6, fontSize: 10, color: '#6b7280' }}>
              {INT_COLORS.find(c => c.id === intId)?.label}
            </div>
            <Divider />
          </>
        )}

        {/* Seal colour */}
        <SectionLabel text="Gasket / Seal Colour" />
        <div style={{ display: 'flex', gap: 8 }}>
          {SEAL_COLORS.map(s => (
            <button
              key={s.label}
              onClick={() => setSealId(s.label.toLowerCase())}
              title={s.label}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 6,
                background: s.hex,
                border: sealId === s.label.toLowerCase()
                  ? `2px solid ${GOLD}` : '2px solid transparent',
                cursor: 'pointer',
                fontSize: 9, color: s.label === 'White' ? '#333' : '#eee',
                fontWeight: 600, letterSpacing: '0.06em',
                transition: 'border-color 0.15s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Divider />

        {/* Profile info */}
        <SectionLabel text="Profile Specification" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { role: 'Frame',        id: '50001', name: 'rama 66mm',        cat: 'FRAME' },
            { role: 'Sash (L)',     id: '50034', name: 'skrzydło 120mm N_Z',cat: 'SASH' },
            { role: 'Sash (R)',     id: '50031', name: 'skrzydło 105mm D_W',cat: 'SASH' },
            { role: 'Movable post', id: '50029', name: 'słupek ruchomy',   cat: 'MOVABLE_POST' },
          ].map(row => (
            <div key={row.id} style={{
              display: 'flex', alignItems: 'center',
              padding: '5px 8px', borderRadius: 5,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              gap: 8,
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: GOLD,
                background: 'rgba(234,182,118,0.12)',
                padding: '2px 5px', borderRadius: 3, minWidth: 38,
                textAlign: 'center',
              }}>
                {row.id}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#c8cad0', fontWeight: 600 }}>
                  {row.role}
                </div>
                <div style={{ fontSize: 9, color: '#6b7280' }}>{row.name}</div>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Opening legend */}
        <SectionLabel text="Operation Guide" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { dot: '#60a5fa', text: 'Blue dot → opens / closes LEFT sash (turn)' },
            { dot: '#fbbf24', text: 'Amber dot → cycles right sash: closed → tilt → turn → closed' },
          ].map(item => (
            <div key={item.dot} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: item.dot, flexShrink: 0, marginTop: 2,
              }} />
              <div style={{ fontSize: 10, color: '#9aa0ad', lineHeight: 1.4 }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Seed info */}
        <div style={{
          padding: '8px 10px', borderRadius: 6,
          background: 'rgba(234,182,118,0.06)',
          border: '1px solid rgba(234,182,118,0.14)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
            DATA SOURCE
          </div>
          <div style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>
            saturday_27_14_37.zip<br />
            profiles.json · window_types.json<br />
            IGLO 5 · 256 types · 79 profiles
          </div>
        </div>
      </div>
    </div>
  );
};

export default F202Page;
