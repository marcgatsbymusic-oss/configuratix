import { buildF252Geometries } from './src/components/configurator/IG5_F252/IG5_F252_Engine.ts';
try {
  const res = buildF252Geometries({ TopSectionHeight: 1400-430, BottomSectionHeight: 430, W: 1200, isMirrored: false, OperableSection: 'Top' });
  console.log('SUCCESS, transomMeshes count:', res.transomMeshes.length);
} catch (e) {
  console.error('ERROR:', e);
}
