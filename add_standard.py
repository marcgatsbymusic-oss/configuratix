import re

with open('src/components/configurator/SLE201Viewer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

standard_left = '''
  /** Child1 left vertical stile (Standard) — provides the mitre corner */
  const renderSashVerticalLeftStandard = () => layerConfigs.flatMap(cfg => {
    if (!isChild1(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours.filter(c => getCentY(c.points) < 150);
    const isSkipCutLayer = false;
    return contours.length === 0 ? [] : [(
      <group key={`svls_${cfg.name}`} position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`svls_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={isSkipCutLayer}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={false}  uSign={-1} uOffset={0}
          />
        ))}
      </group>
    )];
  });
'''

# Insert after renderSashVertical
code = code.replace(
    '  /** Child1 closing stile (standard sash) — rides with sash on the right */',
    standard_left + '\n  /** Child1 closing stile (standard sash) — rides with sash on the right */'
)

# Update JSX to include renderSashVerticalLeftStandard()
code = code.replace(
    '{renderSashVertical()}',
    '{renderSashVerticalLeftStandard()}\n        {renderSashVertical()}'
)

with open('src/components/configurator/SLE201Viewer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
