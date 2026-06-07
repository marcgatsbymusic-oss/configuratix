import re

with open('src/components/configurator/SLE201Viewer.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update renderSashVertical (standard profile) to be on the right side
code = re.sub(
    r'  /\*\* Child1 left vertical stile — rides with sash \*/\n  const renderSashVertical = \(\) => layerConfigs.flatMap\(cfg => \{\n    if \(!isChild1\(cfg\.name\)\) return \[\];\n    const layer = pd\.layers\[cfg\.name\]; if \(!layer\) return \[\];\n    const contours = layer\.contours\.filter\(c => getCentY\(c\.points\) < 150\);\n    const isSkipCutLayer = false;\n    return contours\.length === 0 \? \[\] : \[\(\n      <group key={`sv_\$\{cfg\.name\}`} position=\{\[0, H, 0\]\} rotation=\{\[0, 0, -Math\.PI / 2\]\}>\n        \{contours\.map\(\(c, i\) => \(\n          <FrameSegment\n            key={`sv_seg_\$\{cfg\.name\}_\$\{i\}`}\n            layerName=\{cfg\.name\}   scaleFactor=\{scale\}\n            length=\{height\}        vertices=\{c\.points\}\n            matType=\{cfg\.matType\}  color=\{getColor\(cfg\.colorType\)\}\n            textureUrl=\{getTex\(cfg\.colorType\)\} origin=\{origin\}\n            rotation=\{\[0, Math\.PI / 2, 0\]\}\n            skipCuts=\{isSkipCutLayer\}\n            skipLeftCut=\{false\} skipRightCut=\{false\}\n            invertCuts=\{false\}  uSign=\{-1\} uOffset=\{0\}\n          />\n        \)\)\}\n      </group>\n    \)\];\n  \}\);',
    r'''  /** Child1 closing stile (standard sash) — rides with sash on the right */
  const renderSashVerticalRight = () => layerConfigs.flatMap(cfg => {
    if (!isChild1(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours.filter(c => getCentY(c.points) < 150);
    const isSkipCutLayer = false;
    return contours.length === 0 ? [] : [(
      <group key={`svr_${cfg.name}`} position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`svr_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={isSkipCutLayer}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={true}  uSign={-1} uOffset={0}
          />
        ))}
      </group>
    )];
  });''',
    code
)

# 2. Update renderSashVerticalRight (doorpost profile) to be on the left side, with flat cut
code = re.sub(
    r'  const renderSashVerticalRight = \(\) => doorPostLayerConfigs\.flatMap\(cfg => \{\n    const layer = dpd\.layers\[cfg\.name\]; if \(!layer\) return \[\];\n    const contours = layer\.contours;\n    const isSkipCutLayer = false;\n    return contours\.length === 0 \? \[\] : \[\(\n      <group key={`svr_\$\{cfg\.name\}`} position=\{\[W, 0, 0\]\} rotation=\{\[0, 0, Math\.PI / 2\]\}>\n        \{contours\.map\(\(c, i\) => \(\n          <FrameSegment\n            key={`svr_seg_\$\{cfg\.name\}_\$\{i\}`}\n            layerName=\{cfg\.name\}   scaleFactor=\{scale\}\n            length=\{height\}        vertices=\{c\.points\}\n            matType=\{cfg\.matType\}  color=\{getColor\(cfg\.colorType\)\}\n            textureUrl=\{getTex\(cfg\.colorType\)\} origin=\{origin\}\n            rotation=\{\[0, Math\.PI / 2, 0\]\}\n            skipCuts=\{isSkipCutLayer\}\n            skipLeftCut=\{false\} skipRightCut=\{false\}\n            invertCuts=\{true\}  uSign=\{-1\} uOffset=\{0\}\n          />\n        \)\)\}\n      </group>\n    \)\];\n  \}\);',
    r'''  /** Child1 left vertical stile (Doorpost) — rides with sash */
  const renderSashVertical = () => doorPostLayerConfigs.flatMap(cfg => {
    const layer = dpd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours;
    const isSkipCutLayer = true; // flat cut for the add-on doorpost
    
    // The horizontal sashes use 100mm frame depth. The user wants the doorpost to stop at the mitre cut.
    // That means it should fit perfectly between the horizontal sashes.
    const sashExtMaxY = 100;
    const dpHeight = height - 2 * sashExtMaxY * scale;
    // We position it at sashExtMaxY so it starts where the horizontal profile's inner edge ends.
    // The Z offset was previously computed for standard profiles:
    const pdMaxX = pd.meta.bounds.normalised.maxX;
    const pdMaxY = pd.meta.bounds.normalised.maxY;
    const zOffset = -(pdMaxX - pdMaxY) * scale;
    
    return contours.length === 0 ? [] : [(
      <group key={`sv_${cfg.name}`} position={[0, H - sashExtMaxY * scale, zOffset]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`sv_seg_${cfg.name}_${i}`}
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
  });''',
    code
)

with open('src/components/configurator/SLE201Viewer.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
