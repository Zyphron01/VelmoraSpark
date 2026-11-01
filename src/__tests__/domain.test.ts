import { describe, it, expect } from 'vitest';
import { formatINR, formatINRFull, overrunPercent, addMinutes } from '@/lib/utils';
import { PRESETS } from '@/lib/demo-data';

describe('Velmora Spark Domain & Ops Intelligence', () => {
  describe('Financial & Currency Formatting', () => {
    it('formats numbers into Indian Lakhs and Thousands correctly', () => {
      expect(formatINR(1850000)).toBe('₹18.5L');
      expect(formatINR(420000)).toBe('₹4.2L');
      expect(formatINR(75000)).toBe('₹75k');
    });

    it('formats full Indian Rupees with commas', () => {
      expect(formatINRFull(1850000)).toBe('₹18,50,000');
      expect(formatINRFull(25000)).toBe('₹25,000');
    });

    it('accurately computes budget overrun percentage', () => {
      expect(overrunPercent(100000, 120000)).toBe(20);
      expect(overrunPercent(100000, 90000)).toBe(-10);
      expect(overrunPercent(100000, 100000)).toBe(0);
    });
  });

  describe('Cascading Timeline Engine', () => {
    it('adds minutes correctly to time strings', () => {
      expect(addMinutes('17:00', 30)).toBe('17:30');
      expect(addMinutes('17:45', 30)).toBe('18:15');
      expect(addMinutes('23:45', 30)).toBe('00:15');
    });
  });

  describe('Catering & Turnout Math (P50/P90)', () => {
    it('correctly models turnout variance against blind buffers', () => {
      const wedding = PRESETS.wedding;
      const catering = wedding.catering;
      
      expect(catering.invitedCount).toBe(250);
      expect(catering.blindBufferPlates).toBe(288); // 250 * 1.15
      expect(catering.p50ExpectedTurnout).toBe(195);
      expect(catering.p90PeakTurnout).toBe(225);
      expect(catering.p90PeakTurnout).toBeLessThan(catering.blindBufferPlates);
    });
  });

  describe('Resilience Scenarios', () => {
    it('provides contingency checklists and fallback vendors', () => {
      const scenarios = PRESETS.wedding.scenarios;
      expect(scenarios.length).toBeGreaterThan(0);
      
      const rainScenario = scenarios.find((s) => s.triggerType === 'monsoon_rain');
      expect(rainScenario).toBeDefined();
      expect(rainScenario?.backupVendorUsed).toContain('QuickTent');
      expect(rainScenario?.financialImpact).toBeGreaterThan(0);
    });
  });
});
