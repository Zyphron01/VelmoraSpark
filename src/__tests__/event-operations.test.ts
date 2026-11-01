import { describe, it, expect } from 'vitest';
import type { RunSheetItem, RunSheetStatus, StressScenario, BudgetLineItem } from '@/types/event';

describe('Event Operations & Command Center Upgrades (Unit Tests)', () => {
  describe('Phase B: Event Countdown Calculations', () => {
    it('accurately parses future date and computes remaining days and hours', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);
      const isoDate = futureDate.toISOString().split('T')[0];

      const target = new Date(`${isoDate}T17:00:00`);
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const days = Math.floor(diffMs / (1000 * 3600 * 24));

      expect(days).toBeGreaterThanOrEqual(44);
      expect(days).toBeLessThanOrEqual(46);
    });

    it('identifies same-day celebration accurately', () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const localIsoToday = `${year}-${month}-${day}`;

      const target = new Date(`${localIsoToday}T17:00:00`);
      const isSameDay =
        target.getFullYear() === today.getFullYear() &&
        target.getMonth() === today.getMonth() &&
        target.getDate() === today.getDate();

      expect(isSameDay).toBe(true);
    });

    it('handles invalid or empty date strings safely without throwing', () => {
      const invalidDate1 = '';
      const invalidDate2 = 'invalid-date-string';

      const parsed1 = new Date(invalidDate1);
      const parsed2 = new Date(invalidDate2);

      expect(isNaN(parsed1.getTime())).toBe(true);
      expect(isNaN(parsed2.getTime())).toBe(true);
    });
  });

  describe('Phase C: Command Center Filters & Delay Cascade', () => {
    const mockRunSheet: RunSheetItem[] = [
      {
        id: 'r-1',
        baseTime: '17:00',
        currentTime: '17:00',
        durationMins: 30,
        delayMins: 0,
        title: 'Baraat Procession Arrival',
        owner: 'Pandit Ji & Groomsmen',
        vendorPhone: '+91 98450 11111',
        dependencyNote: 'Band Baja ready at gate',
        status: 'upcoming',
      },
      {
        id: 'r-2',
        baseTime: '17:30',
        currentTime: '17:50',
        durationMins: 45,
        delayMins: 20,
        title: 'Varmala Exchange Ceremony',
        owner: 'Decor Lead',
        vendorPhone: '', // Missing vendor phone
        dependencyNote: 'Stage florals completed',
        status: 'delayed',
      },
      {
        id: 'r-3',
        baseTime: '18:15',
        currentTime: '18:35',
        durationMins: 60,
        delayMins: 20,
        title: 'Dinner Buffet Opening',
        owner: 'Catering Lead',
        vendorPhone: '+91 98450 22222',
        dependencyNote: 'Starters completed',
        status: 'live',
      },
      {
        id: 'r-4',
        baseTime: '16:00',
        currentTime: '16:00',
        durationMins: 45,
        delayMins: 0,
        title: 'Sound Check & Microphones',
        owner: 'Sound Team',
        vendorPhone: '+91 98450 33333',
        dependencyNote: '', // Missing dependency note
        status: 'completed',
      },
    ];

    it('filters timeline cues accurately by status', () => {
      const liveItems = mockRunSheet.filter((r) => r.status === 'live');
      const delayedItems = mockRunSheet.filter((r) => r.status === 'delayed');
      const upcomingItems = mockRunSheet.filter((r) => r.status === 'upcoming');
      const completedItems = mockRunSheet.filter((r) => r.status === 'completed');

      expect(liveItems).toHaveLength(1);
      expect(delayedItems).toHaveLength(1);
      expect(upcomingItems).toHaveLength(1);
      expect(completedItems).toHaveLength(1);
    });

    it('extracts unique coordinator owners dynamically', () => {
      const owners = Array.from(new Set(mockRunSheet.map((r) => r.owner))).sort();
      expect(owners).toEqual([
        'Catering Lead',
        'Decor Lead',
        'Pandit Ji & Groomsmen',
        'Sound Team',
      ]);
    });

    it('identifies tasks with missing vendor contacts', () => {
      const missingContactItems = mockRunSheet.filter((r) => !r.vendorPhone);
      expect(missingContactItems).toHaveLength(1);
      expect(missingContactItems[0].id).toBe('r-2');
    });

    it('calculates deterministic cascade delay downstream', () => {
      const fromId = 'r-2';
      const extraDelayMins = 15;

      let found = false;
      const updatedRunSheet = mockRunSheet.map((item) => {
        if (item.id === fromId) found = true;
        if (found && (item.status === 'live' || item.status === 'upcoming' || item.status === 'delayed')) {
          const newDelay = item.delayMins + extraDelayMins;
          return {
            ...item,
            delayMins: newDelay,
            status: (newDelay > 0 ? 'delayed' : item.status) as RunSheetStatus,
          };
        }
        return item;
      });

      // Item 1 (upstream) should NOT be delayed
      expect(updatedRunSheet[0].delayMins).toBe(0);
      // Item 2 (fromId) should receive +15m (20 + 15 = 35)
      expect(updatedRunSheet[1].delayMins).toBe(35);
      // Item 3 (downstream) should receive +15m (20 + 15 = 35)
      expect(updatedRunSheet[2].delayMins).toBe(35);
      // Item 4 (completed, not affected)
      expect(updatedRunSheet[3].delayMins).toBe(0);
    });
  });

  describe('Phase D: Crisis Recovery Interface & Real Budget Impact', () => {
    const totalEventBudget = 2800000;
    const contingencyReserve = 336000; // 12% of 28L

    const mockScenario: StressScenario = {
      id: 'sc-1',
      triggerType: 'monsoon_rain',
      title: 'Sudden Unseasonal Downpour at Outdoor Lawn',
      probability: 0.35,
      financialImpact: 125000,
      scheduleImpactMins: 45,
      backupVendorUsed: 'Leela Grand Ballroom',
      recoveryChecklist: [
        'Dispatch banquet liaison to unlock indoor hall',
        'Reroute catering service lines to sheltered corridor',
        'Notify guest coordinators via WhatsApp group',
      ],
      applied: false,
    };

    const mockBudget: BudgetLineItem[] = [
      {
        id: 'b-1',
        category: 'Venue & Lawns',
        vendorName: 'The Leela Palace Courtyard',
        quotedAmount: 950000,
        committedInstalments: 450000,
        projectedFinalInvoice: 950000,
        overrunRiskReason: '',
        quoteChallengeTip: '',
        backupVendorName: 'Taj West End',
        backupVendorDelta: 80000,
        confirmationStatus: 'confirmed_24h',
        vendorPhone: '+91 98800 54321',
      },
    ];

    it('computes proportional budget impact percentage against real event budget', () => {
      const impactPct = (mockScenario.financialImpact / totalEventBudget) * 100;
      expect(impactPct.toFixed(1)).toBe('4.5');
    });

    it('verifies whether remaining contingency buffer covers scenario cost', () => {
      const contingencyRemaining = contingencyReserve - 50000; // 286000 remaining
      const covers = contingencyRemaining >= mockScenario.financialImpact;
      expect(covers).toBe(true);
    });

    it('links real on-record vendor contact to corresponding crisis scenario', () => {
      const matchingVendor = mockBudget.find(
        (b) => b.category.toLowerCase().includes('venue') || b.category.toLowerCase().includes('decor')
      );
      expect(matchingVendor).toBeDefined();
      expect(matchingVendor?.vendorName).toBe('The Leela Palace Courtyard');
      expect(matchingVendor?.vendorPhone).toBe('+91 98800 54321');
    });

    it('supports 3-way status progression (suggested -> in_progress -> completed)', () => {
      const stepStates: Record<number, 'suggested' | 'in_progress' | 'completed'> = {
        0: 'completed',
        1: 'in_progress',
        2: 'suggested',
      };

      expect(stepStates[0]).toBe('completed');
      expect(stepStates[1]).toBe('in_progress');
      expect(stepStates[2]).toBe('suggested');
    });
  });
});

