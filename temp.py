import os
import re

with open('src/components/configurator/SLE201Viewer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace renderSashVertical
sv_pattern = re.compile(
    r'  /\*\* Child1 left vertical stile — rides with sash \*/\s*'
    r'const renderSashVertical = \(\) => layerConfigs\.flatMap\(cfg => \{.*?'
    r'</group>\s*\)\];\s*\}\);', re.DOTALL
)

sv_replacement = """  /** Child1 closing stile (standard sash) — rides with sash on the right */
  const renderSashVerticalRight = () => layerConfigs.flatMap(cfg => {
    if (!isChild1(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours.filter(c => getCentY(c.points) < 150);
    const isSkipCutLayer = false;
    return contours.length === 0 ? [] : [(
      <group key={`sv_${cfg.name}`} position={[W, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => {
          const mirroredPoints = c.points.map(p => ({
            x: p.x,
            y: -p.y
          })).reverse();
          return (
          <FrameSegment
            key={`sv_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={mirroredPoints}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={isSkipCutLayer}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={false}  uSign={-1} uOffset={0}
          />
        )})}
      </group>
    )];
  });"""

code = sv_pattern.sub(sv_replacement, code)

# Replace renderSashVerticalRight
svr_pattern = re.compile(
    r'  const renderSashVerticalRight = \(\) => doorPostLayerConfigs\.flatMap\(cfg => \{.*?'
    r'</group>\s*\)\];\s*\}\);', re.DOTALL
)

svr_replacement = """  const renderSashVerticalLeftDoorpost = () => doorPostLayerConfigs.flatMap(cfg => {
    const layer = dpd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours;
    const isSkipCutLayer = false;
    
    // doorpost bounds
    const maxX = dpd.meta.bounds.normalised.maxX;
    const maxY = dpd.meta.bounds.normalised.maxY;

    // Calculate dynamic stretch based ONLY on the solid exterior frame profiles
    let sashExtMaxY = 0;
    const sashExtLayer = pd.layers['DOOR_FRM_EXT'];
    if (sashExtLayer) {
      sashExtLayer.contours.forEach(c => {
        if (getCentY(c.points) < 150) {
          c.points.forEach(p => { if (p.y > sashExtMaxY) sashExtMaxY = p.y; });
        }
      });
    }

    let dpExtMaxX = 0;
    const dpExtLayer = dpd.layers['DOOR_POST_FRM_EXT'];
    if (dpExtLayer) {
      dpExtLayer.contours.forEach(c => {
        c.points.forEach(p => { if (p.x > dpExtMaxX) dpExtMaxX = p.x; });
      });
    }

    const stretchY = (sashExtMaxY > 0 && dpExtMaxX > 0) ? sashExtMaxY / dpExtMaxX : 1.0;

    // Align inner faces: sash inner face is at -sashMaxX. 
    // Doorpost inner face is at local x = maxY.
    const sashMaxX = pd.meta.bounds.normalised.maxX;
    const zOffset = -(sashMaxX - maxY) * scale;

    return contours.length === 0 ? [] : [(
      <group key={`svr_${cfg.name}`} position={[0, 0, zOffset]} rotation={[0, 0, Math.PI / 2]}>
        {contours.map((c, i) => {
          // Rotate and stretch width to match sash height, flip to face right
          const rotatedPoints = c.points.map(p => ({
            x: maxY - p.y,
            y: -p.x * stretchY
          })).reverse();
          return (
            <FrameSegment
              key={`svr_seg_${cfg.name}_${i}`}
              layerName={`${cfg.name}_rot270_flush_xy_stretch`}   scaleFactor={scale}
              length={height}        vertices={rotatedPoints}
              matType={cfg.matType}  color={getColor(cfg.colorType)}
              textureUrl={getTex(cfg.colorType)} origin={origin}
              rotation={[0, Math.PI / 2, 0]}
              skipCuts={isSkipCutLayer}
              skipLeftCut={false} skipRightCut={false}
              invertCuts={false}  uSign={-1} uOffset={0}
            />
          );
        })}
      </group>
    )];
  });"""

code = svr_pattern.sub(svr_replacement, code)

with open('src/components/configurator/SLE201Viewer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
