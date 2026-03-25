import React from 'react';

interface WindowGraphicProps {
  id: string;
  className?: string;
}

// A highly optimized coordinate map (x, y, w, h in %) representing the 14 window structures
const LAYOUT_MAP: Record<string, {x: number, y: number, w: number, h: number}[]> = {
  '1-flugel': [{ x: 0, y: 0, w: 100, h: 100 }],
  '1-flugel-oberlicht': [
    { x: 0, y: 0, w: 100, h: 30 }, // Top
    { x: 0, y: 30, w: 100, h: 70 } // Bottom
  ],
  '1-flugel-unterlicht': [
    { x: 0, y: 0, w: 100, h: 70 }, // Top
    { x: 0, y: 70, w: 100, h: 30 } // Bottom
  ],
  '2-flugel': [
    { x: 0, y: 0, w: 50, h: 100 },
    { x: 50, y: 0, w: 50, h: 100 }
  ],
  '2-flugel-oberlicht': [
    { x: 0, y: 0, w: 100, h: 30 }, // Top
    { x: 0, y: 30, w: 50, h: 70 }, // Bottom Left
    { x: 50, y: 30, w: 50, h: 70 } // Bottom Right
  ],
  '2-flugel-oberlicht-asym': [
    { x: 0, y: 0, w: 100, h: 30 }, // Top
    { x: 0, y: 30, w: 35, h: 70 }, // Bottom Left
    { x: 35, y: 30, w: 65, h: 70 } // Bottom Right
  ],
  '2-flugel-unterlicht': [
    { x: 0, y: 0, w: 50, h: 70 }, // Top Left
    { x: 50, y: 0, w: 50, h: 70 }, // Top Right
    { x: 0, y: 70, w: 100, h: 30 } // Bottom
  ],
  '2-flugel-unterlicht-asym': [
    { x: 0, y: 0, w: 35, h: 70 }, // Top Left
    { x: 35, y: 0, w: 65, h: 70 }, // Top Right
    { x: 0, y: 70, w: 100, h: 30 } // Bottom
  ],
  '3-flugel': [
    { x: 0, y: 0, w: 33.33, h: 100 },
    { x: 33.33, y: 0, w: 33.33, h: 100 },
    { x: 66.66, y: 0, w: 33.34, h: 100 }
  ],
  '3-flugel-oberlicht': [
    { x: 0, y: 0, w: 100, h: 30 }, // Top
    { x: 0, y: 30, w: 33.33, h: 70 },
    { x: 33.33, y: 30, w: 33.33, h: 70 },
    { x: 66.66, y: 30, w: 33.34, h: 70 }
  ],
  '3-flugel-oberlicht-asym': [
    { x: 0, y: 0, w: 100, h: 30 }, // Top
    { x: 0, y: 30, w: 25, h: 70 }, // Side Left
    { x: 25, y: 30, w: 50, h: 70 }, // Center Large
    { x: 75, y: 30, w: 25, h: 70 } // Side Right
  ],
  '3-flugel-unterlicht': [
    { x: 0, y: 0, w: 33.33, h: 70 },
    { x: 33.33, y: 0, w: 33.33, h: 70 },
    { x: 66.66, y: 0, w: 33.34, h: 70 },
    { x: 0, y: 70, w: 100, h: 30 } // Bottom
  ],
  '3-flugel-unterlicht-asym': [
    { x: 0, y: 0, w: 25, h: 70 }, // Side Left
    { x: 25, y: 0, w: 50, h: 70 }, // Center Large
    { x: 75, y: 0, w: 25, h: 70 }, // Side Right
    { x: 0, y: 70, w: 100, h: 30 } // Bottom
  ],
  '4-flugel': [
    { x: 0, y: 0, w: 25, h: 100 },
    { x: 25, y: 0, w: 25, h: 100 },
    { x: 50, y: 0, w: 25, h: 100 },
    { x: 75, y: 0, w: 25, h: 100 }
  ]
};

export const WindowTypeGraphic: React.FC<WindowGraphicProps> = ({ id, className = '' }) => {
  const layout = LAYOUT_MAP[id] || LAYOUT_MAP['1-flugel'];

  return (
    <svg 
      viewBox="0 0 100 120" 
      className={`w-full h-full stroke-current fill-transparent ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Outer master frame */}
      <rect x="2" y="2" width="96" height="116" strokeWidth="4" className="stroke-current" rx="2" />
      
      {layout.map((sash, i) => {
        // Map 0-100% bounds down to 92x112 to account for the outer frame padding
        const x = 4 + (sash.x / 100) * 92;
        const y = 4 + (sash.y / 100) * 112;
        const w = (sash.w / 100) * 92;
        const h = (sash.h / 100) * 112;

        return (
          <g key={i}>
            {/* Inner Sash Frame - Rendered as clean fixed glazing */}
            <rect 
              x={x} 
              y={y} 
              width={w} 
              height={h} 
              strokeWidth="2" 
              className="stroke-current opacity-80" 
            />
          </g>
        );
      })}
    </svg>
  );
};
