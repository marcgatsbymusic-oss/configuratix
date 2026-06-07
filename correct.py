import re

with open('src/components/configurator/SLE201Viewer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

doorpost_left = '''
  /** Child1 left vertical stile (Doorpost) — flat cut add-on */
  const renderSashVerticalLeftDoorpost = () => doorPostLayerConfigs.flatMap(cfg => {
    const layer = dpd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours;
    const isSkipCutLayer = true; // flat cut for the add-on doorpost
    
    // Stop at the mitre cut: fits perfectly between horizontal sashes
    const sashExtMaxY = 100;
    const dpHeight = height - 2 * sashExtMaxY * scale;
    // We position it at sashExtMaxY so it starts where the horizontal profile's inner edge ends.
    const pdMaxX = pd.meta.bounds.normalised.maxX;
    const pdMaxY = pd.meta.bounds.normalised.maxY;
    const zOffset = -(pdMaxX - pdMaxY) * scale;
    
    return contours.length === 0 ? [] : [(
      <group key={`svldp_${cfg.name}`} position={[0, H - sashExtMaxY * scale, zOffset]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`svldp_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={dpHeight}      vertices={c.points}
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

# 1. Insert renderSashVerticalLeftDoorpost after renderSashVertical
code = code.replace(
    '  const renderSashVerticalRight = () => doorPostLayerConfigs.flatMap(cfg => {',
    doorpost_left + '\n  const renderSashVerticalRight = () => doorPostLayerConfigs.flatMap(cfg => {'
)

# 2. Update JSX to include renderSashVerticalLeftDoorpost() right after renderSashVertical()
code = code.replace(
    '{renderSashVertical()}\n\n        {/* Sash right vertical stile (Doorpost) */}',
    '{renderSashVertical()}\n        {renderSashVerticalLeftDoorpost()}\n\n        {/* Sash right vertical stile (Doorpost) */}'
)

with open('src/components/configurator/SLE201Viewer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
