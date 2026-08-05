import { describe, it, expect } from 'vitest';
import { 
  MechanicalFixingCalculator, 
  ConfigurationUnverifiedError 
} from '../services/MechanicalFixingCalculator';
import { PLACEHOLDER_UNVERIFIED } from '../config/MechanicalFixingConfig';

describe('Mechanical Fixing Rules Engine', () => {
  const calculator = new MechanicalFixingCalculator();

  it('FR-5.16 & FR-5.21: Should BLOCK output if configuration has placeholders', () => {
    const unverifiedConfig = {
      screwSpecification: PLACEHOLDER_UNVERIFIED,
      minHolesPerSide: PLACEHOLDER_UNVERIFIED,
      maxSpacingMm: PLACEHOLDER_UNVERIFIED,
      cornerOffsetMm: 150,
      tighteningSequence: PLACEHOLDER_UNVERIFIED,
    };

    expect(() => {
      calculator.calculateFixingDiagram(1000, 1500, unverifiedConfig);
    }).toThrow(ConfigurationUnverifiedError);
  });

  it('Should successfully calculate if configuration is fully verified', () => {
    // A mock verified configuration (these values would theoretically come from Drutex technical docs)
    const verifiedConfig = {
      screwSpecification: '7x152mm frame screw',
      minHolesPerSide: 2,
      maxSpacingMm: 700,
      cornerOffsetMm: 150,
      tighteningSequence: 'Cross-corner alternating',
    };

    const result = calculator.calculateFixingDiagram(1000, 1500, verifiedConfig);
    
    // Window is 1500 high. Available height = 1500 - 300 (corners) = 1200mm.
    // 1200 / 700 = 1.71 segments => 2 segments => 3 holes.
    // Holes at 150, 750, 1350.
    expect(result.holes.length).toBe(3);
    expect(result.holes[0].offsetFromBottomLeftMm).toBe(150);
    expect(result.holes[1].offsetFromBottomLeftMm).toBe(750);
    expect(result.holes[2].offsetFromBottomLeftMm).toBe(1350);
    
    expect(result.screwSpec).toBe('7x152mm frame screw');
    expect(result.sequence).toBe('Cross-corner alternating');
  });

  it('Should default to min holes if window is very small', () => {
    const verifiedConfig = {
      screwSpecification: '7x152mm frame screw',
      minHolesPerSide: 2,
      maxSpacingMm: 700,
      cornerOffsetMm: 150,
      tighteningSequence: 'Cross-corner alternating',
    };

    // Very small window, 500mm height
    // Available height = 500 - 300 = 200mm.
    // 200 / 700 = 0.28 segments => 1 segment => 2 holes (which matches minHoles).
    const result = calculator.calculateFixingDiagram(500, 500, verifiedConfig);
    
    expect(result.holes.length).toBe(2);
    expect(result.holes[0].offsetFromBottomLeftMm).toBe(150);
    expect(result.holes[1].offsetFromBottomLeftMm).toBe(350);
  });
});
