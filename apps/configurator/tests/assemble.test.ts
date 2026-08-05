import { describe, it, expect } from 'vitest';
import { transformPoint, transformLoop, computeBoundingBox, assembleWindow, WindowSpecification } from '../engine/assemble.ts';
import path from 'path';

describe('Window Assembly Engine', () => {
  describe('transformPoint', () => {
    it('should translate points correctly without rotation', () => {
      const pt = { x: 10, y: 20 };
      const offset: [number, number] = [5, -5];
      const result = transformPoint(pt, offset, 0);
      expect(result.x).toBe(15);
      expect(result.y).toBe(15);
    });

    it('should rotate points correctly by 90 degrees', () => {
      const pt = { x: 10, y: 0 };
      const offset: [number, number] = [0, 0];
      const result = transformPoint(pt, offset, 90);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(10);
    });

    it('should rotate and translate points correctly', () => {
      const pt = { x: 10, y: 0 };
      const offset: [number, number] = [5, 5];
      const result = transformPoint(pt, offset, 90);
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(15);
    });
  });

  describe('transformLoop', () => {
    it('should transform a complete loop of points', () => {
      const loop = {
        closed: true,
        pts: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
          { x: 0, y: 10 },
        ],
      };
      const result = transformLoop(loop, [2, 3], 0);
      expect(result.closed).toBe(true);
      expect(result.pts[0]).toEqual({ x: 2, y: 3 });
      expect(result.pts[2]).toEqual({ x: 12, y: 13 });
    });
  });

  describe('computeBoundingBox', () => {
    it('should compute the correct bounding box', () => {
      const loops = [
        {
          closed: true,
          pts: [
            { x: -5, y: 12 },
            { x: 15, y: -2 },
          ],
        },
      ];
      const bbox = computeBoundingBox(loops);
      expect(bbox).toEqual([-5, -2, 15, 12]);
    });

    it('should return null for empty loops', () => {
      expect(computeBoundingBox([])).toBeNull();
    });
  });

  describe('assembleWindow', () => {
    it('should assemble a single_sash window using real files', () => {
      const spec: WindowSpecification = {
        windowType: 'single_sash',
        width: 1000,
        height: 1200,
        profileMapping: {
          'rama 01': 'frame__50001_rama_66mm.json',
          'skrzydło 01': 'sash__50013_skrzyd_o_niezlicowane.json',
        },
        profilesDir: path.resolve(__dirname, '../data/profiles'),
        recipesFile: path.resolve(__dirname, '../data/recipes/zlozenie_recipes.json'),
      };

      const result = assembleWindow(spec);
      expect(result).toHaveLength(2);

      // Verify Frame Component
      const frameComp = result.find(c => c.componentType === 'frame');
      expect(frameComp).toBeDefined();
      expect(frameComp!.profileName).toBe('50001 - rama 66mm');
      expect(frameComp!.offset2D).toEqual([0, 0]);
      expect(frameComp!.rotation2D).toBe(0);

      // Verify Sash Component
      const sashComp = result.find(c => c.componentType === 'sash');
      expect(sashComp).toBeDefined();
      expect(sashComp!.profileName).toBe('50013 - skrzydło niezlicowane');
      expect(sashComp!.offset2D).toEqual([0, 45.0]);
      expect(sashComp!.rotation2D).toBe(0);
    });

    it('should assemble a single_fixed window using real files', () => {
      const spec: WindowSpecification = {
        windowType: 'single_fixed',
        width: 1000,
        height: 1200,
        profileMapping: {
          'rama 01': 'frame__50001_rama_66mm.json',
          'mostek podszybowy': 'spacer_bridge__mostek_podszybowy.json',
          'szyba 24mm': 'glass__szyba_24mm.json',
          '50924 - listwa 22mm': 'glazing_bead__50924_listwa_22mm.json',
        },
        profilesDir: path.resolve(__dirname, '../data/profiles'),
        recipesFile: path.resolve(__dirname, '../data/recipes/zlozenie_recipes.json'),
      };

      const result = assembleWindow(spec);
      expect(result).toHaveLength(4);

      const glassComp = result.find(c => c.componentType === 'glass');
      expect(glassComp).toBeDefined();
      expect(glassComp!.profileName).toBe('szyba 24mm');
      expect(glassComp!.offset2D).toEqual([-55.0, 66.0]);
    });
  });
});
