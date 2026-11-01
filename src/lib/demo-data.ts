import type {
  EventPlan,
  PlanSuggestion,
  BudgetLineItem,
  CateringMathModel,
  StressScenario,
  RunSheetItem,
  Guest,
} from '@/types/event';

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 1 — 250-Guest Bengaluru Courtyard Wedding ₹18.5L
// ─────────────────────────────────────────────────────────────────────────────

export const weddingEvent: EventPlan = {
  id: 'wedding-blr-2025',
  title: 'Royal Courtyard Wedding',
  category: 'wedding',
  date: '2025-02-14',
  city: 'Bengaluru',
  invitedCount: 250,
  confirmedRsvpCount: 178,
  totalBudget: 1850000,
  contingencyReservePercent: 8,
  activeWhatsappGroupsReplaced: 8,
};

export const weddingSuggestions: PlanSuggestion[] = [
  {
    id: 'ws-1',
    phase: 'Pre-Event',
    title: 'Marigold & Jasmine Mandap Décor — Courtyard Setup',
    estimatedCost: 185000,
    costRationale:
      'Bengaluru vendors quote ₹1.8–2.2L for courtyard mandaps. The ₹1.85L figure includes 400 marigold strings, jasmine garlands, and brass lamp hire. Challenge: ask them to itemise flower cost vs. labour separately — labour is often inflated 40%. Counter with ₹1.5L + ₹35k installation fee.',
    wasteImpact: 'Composting arrangement can divert ~22 kg of flowers post-ceremony.',
    accessibilityNote: 'Request 1.2 m clear aisle width for wheelchair access; confirm ramp to mandap stage.',
    status: 'approved',
  },
  {
    id: 'ws-2',
    phase: 'Pre-Event',
    title: 'Professional Photography & Videography (2-Day)',
    estimatedCost: 120000,
    costRationale:
      'Bengaluru market rate for a 2-photographer + 2-videographer team is ₹80k–1.5L. ₹1.2L is mid-market. Key lever: ask if they own or rent their drones — rental cost is ~₹8k/day and should NOT be passed to you at ₹25k markup. Also negotiate raw file delivery to avoid album-ransom.',
    wasteImpact: 'Digital delivery eliminates physical proof albums (saves ~0.8 kg paper waste).',
    accessibilityNote: 'Brief photographers on capturing guests with mobility aids for inclusive family album.',
    status: 'pending',
  },
  {
    id: 'ws-3',
    phase: 'Event Day',
    title: 'Live Carnatic Music Ensemble (Nadaswaram + Tavil)',
    estimatedCost: 45000,
    costRationale:
      'Standard Nadaswaram duo rate in Bengaluru is ₹30–55k for a 4-hour session. ₹45k is fair. Watch out for: "transport surcharge" (should be ≤₹2k from within city), and "amplification fee" — their own microphones should be included. Push back on any charge above ₹5k for sound support.',
    wasteImpact: 'Live music produces zero single-use electronic waste vs. DJ setups with disposable accessories.',
    accessibilityNote: 'Place ensemble away from elderly seating section; volume should not exceed 85 dB at seating.',
    status: 'pending',
  },
  {
    id: 'ws-4',
    phase: 'Post-Event',
    title: 'Guest Return Gifts — Handcrafted Kondapalli Toys',
    estimatedCost: 37500,
    costRationale:
      'At ₹150/gift × 250 guests = ₹37.5k. Vendor quotes often bundle gift-wrapping at ₹30–40/piece. Buy kraft paper in bulk yourself for ₹8/piece. Also verify artisan certificates — uncertified products are sometimes cheaper knockoffs.',
    wasteImpact: 'Kondapalli wood toys are biodegradable; avoids plastic gift waste. ~3.5 kg plastic prevented.',
    accessibilityNote: 'No accessibility impact. Ensure gifts are placed at reachable height on tables.',
    status: 'pending',
  },
];

export const weddingBudget: BudgetLineItem[] = [
  {
    id: 'bl-1',
    category: 'Venue',
    vendorName: 'Vivanta Courtyard, Koramangala',
    quotedAmount: 450000,
    committedInstalments: 225000,
    projectedFinalInvoice: 495000,
    overrunRiskReason: 'Venue typically adds ₹25k for generator standby + ₹20k for extra tables not in initial quote.',
    quoteChallengeTip: 'Ask for all-inclusive pricing in writing. Specifically exclude: extra generator hire, overtime charges after 10 PM, and additional security deposit.',
    backupVendorName: 'Sheraton Garden Banquets',
    backupVendorDelta: -35000,
    confirmationStatus: 'confirmed_24h',
    vendorPhone: '+919876543210',
  },
  {
    id: 'bl-2',
    category: 'Catering',
    vendorName: 'Nagarjuna Caterers',
    quotedAmount: 550000,
    committedInstalments: 165000,
    projectedFinalInvoice: 610000,
    overrunRiskReason: 'Per-plate creep: if turnout exceeds 220, they charge ₹1.1k vs quoted ₹900. High risk event.',
    quoteChallengeTip: 'Negotiate a fixed slab: 200–240 guests at ₹900/plate, 240–270 at ₹920/plate. Get this written. Also confirm Jain menu is not separately charged.',
    backupVendorName: 'MTR Catering Services',
    backupVendorDelta: 22000,
    confirmationStatus: 'pending_ping',
    vendorPhone: '+919845012345',
  },
  {
    id: 'bl-3',
    category: 'Décor',
    vendorName: 'Petal & Brass Studios',
    quotedAmount: 185000,
    committedInstalments: 92500,
    projectedFinalInvoice: 195000,
    overrunRiskReason: 'Flower price volatility in Feb (wedding season peak) can push marigold costs up 15–20%.',
    quoteChallengeTip: 'Lock in flower price with a price-ceiling clause. If marigold wholesale > ₹80/kg, they absorb the difference up to 10%.',
    backupVendorName: 'Greens & Blooms Co.',
    backupVendorDelta: -15000,
    confirmationStatus: 'at_risk',
    vendorPhone: '+919731234567',
  },
  {
    id: 'bl-4',
    category: 'Photography',
    vendorName: 'Frame & Light Studios',
    quotedAmount: 120000,
    committedInstalments: 60000,
    projectedFinalInvoice: 125000,
    overrunRiskReason: 'Potential overtime charges if mehendi ceremony runs past agreed hours.',
    quoteChallengeTip: 'Define shoot end-time clearly. Include a ₹3k/hour overtime rate in contract rather than open-ended.',
    backupVendorName: 'Candid Clicks BLR',
    backupVendorDelta: -10000,
    confirmationStatus: 'confirmed_24h',
    vendorPhone: '+919663456789',
  },
  {
    id: 'bl-5',
    category: 'Music & Entertainment',
    vendorName: 'Raga Ensemble',
    quotedAmount: 45000,
    committedInstalments: 22500,
    projectedFinalInvoice: 48000,
    overrunRiskReason: 'Transport surcharge added post-booking if venue changes zone.',
    quoteChallengeTip: 'Confirm venue address in contract and cap transport at ₹2,500 within BBMP limits.',
    backupVendorName: 'Sur Tarang Music',
    backupVendorDelta: 5000,
    confirmationStatus: 'pending_ping',
    vendorPhone: '+919845678901',
  },
];

export const weddingCatering: CateringMathModel = {
  invitedCount: 250,
  rsvpConfirmed: 178,
  p50ExpectedTurnout: 195,
  p90PeakTurnout: 225,
  blindBufferPlates: 288, // 250 × 1.15
  recommendedPlates: 225,
  perPlateCost: 900,
  jainPlates: 35,
  veganPlates: 18,
  allergySafePlates: 12,
  elderlySeatingCount: 28,
};

export const weddingScenarios: StressScenario[] = [
  {
    id: 'sc-1',
    triggerType: 'monsoon_rain',
    title: 'Monsoon Rain 3 Hours Before Outdoor Muhurtham',
    probability: 0.35,
    financialImpact: 45000,
    scheduleImpactMins: 30,
    backupVendorUsed: 'QuickTent Bengaluru — Marquee Hire (+₹35k, 2-hr setup)',
    recoveryChecklist: [
      'Call QuickTent immediately — 2-hour mobilisation window',
      'Shift muhurtham timing by 30 min to allow tent setup',
      'Notify priest and guests via WhatsApp broadcast',
      'Confirm sound system is waterproofed or moved indoors',
      'Coordinate with venue for indoor overflow seating (+40 chairs)',
      'Alert caterers that serving station must move under cover',
    ],
    applied: false,
  },
  {
    id: 'sc-2',
    triggerType: 'vendor_cancellation',
    title: 'Decorator Cancels 48 Hours Before Wedding',
    probability: 0.12,
    financialImpact: 28000,
    scheduleImpactMins: 0,
    backupVendorUsed: 'Greens & Blooms Co. (backup, -₹15k vs primary)',
    recoveryChecklist: [
      'Activate Greens & Blooms Co. immediately — send booking confirmation',
      'Transfer design brief and mandap dimensions',
      'Confirm flower availability for Feb date (peak season)',
      'Request ₹92.5k deposit refund from primary vendor',
      'Brief backup vendor on accessibility aisle width requirement',
      'Update venue coordinator on new décor team contact',
    ],
    applied: false,
  },
  {
    id: 'sc-3',
    triggerType: 'guest_surge_20',
    title: '+20% Unannounced Guest Surge at Gate (≈50 extra guests)',
    probability: 0.45,
    financialImpact: 52000,
    scheduleImpactMins: 15,
    backupVendorUsed: 'Nagarjuna Caterers — slab-rate activation (240–270 guests)',
    recoveryChecklist: [
      'Activate pre-agreed caterer surge slab immediately',
      'Communicate count update to catering head on-site',
      'Open overflow seating area (pre-arranged with venue)',
      'Adjust buffet replenishment cycle from 45 to 30 mins',
      'Inform photographer of expanded guest count for group shots',
      'Update run sheet: cocktail hour extended by 15 min',
    ],
    applied: false,
  },
  {
    id: 'sc-4',
    triggerType: 'power_sound_delay',
    title: '45-Min Power / Sound Check Delay Before Ceremony',
    probability: 0.28,
    financialImpact: 8000,
    scheduleImpactMins: 45,
    backupVendorUsed: 'Venue DG Set (included in contract)',
    recoveryChecklist: [
      'Switch to venue DG set — verify fuel (should have 6-hr capacity)',
      'Ask sound vendor to skip non-essential mics; keep core 4 channels',
      'Cascade all downstream run-sheet items +45 mins',
      'Notify priest of time shift (auspicious window must be preserved)',
      'Send revised timeline to all vendors via WhatsApp broadcast',
      'Brief catering to delay first course fire by 45 mins',
    ],
    applied: false,
  },
];

export const weddingRunSheet: RunSheetItem[] = [
  { id: 'rs-1', baseTime: '07:00', currentTime: '07:00', durationMins: 60, delayMins: 0, title: 'Venue Setup & Décor Installation', owner: 'Petal & Brass Studios', vendorPhone: '+919731234567', dependencyNote: 'Must complete before guest arrival', status: 'completed' },
  { id: 'rs-2', baseTime: '08:00', currentTime: '08:00', durationMins: 90, delayMins: 0, title: 'Catering Setup & Buffet Station Prep', owner: 'Nagarjuna Caterers', vendorPhone: '+919845012345', dependencyNote: 'Parallel with décor', status: 'completed' },
  { id: 'rs-3', baseTime: '09:30', currentTime: '09:30', durationMins: 30, delayMins: 0, title: 'Nadaswaram Ensemble Soundcheck', owner: 'Raga Ensemble', vendorPhone: '+919845678901', dependencyNote: 'Before first guests arrive', status: 'live' },
  { id: 'rs-4', baseTime: '10:00', currentTime: '10:00', durationMins: 30, delayMins: 0, title: 'Guest Arrival & Welcome (Navari milk)', owner: 'MC — Suresh', vendorPhone: '+919900112233', dependencyNote: 'Doors open', status: 'upcoming' },
  { id: 'rs-5', baseTime: '10:30', currentTime: '10:30', durationMins: 45, delayMins: 0, title: 'Muhurtham Ceremony', owner: 'Pandit Raghavendra', vendorPhone: '+919845567890', dependencyNote: 'Auspicious window 10:28–11:14 AM', status: 'upcoming' },
  { id: 'rs-6', baseTime: '11:15', currentTime: '11:15', durationMins: 75, delayMins: 0, title: 'Lunch Service — Sadya Buffet', owner: 'Nagarjuna Caterers', vendorPhone: '+919845012345', dependencyNote: 'Fire first course at ceremony close', status: 'upcoming' },
  { id: 'rs-7', baseTime: '12:30', currentTime: '12:30', durationMins: 30, delayMins: 0, title: 'Family Group Photography', owner: 'Frame & Light Studios', vendorPhone: '+919663456789', dependencyNote: 'Post-lunch, before guests leave', status: 'upcoming' },
  { id: 'rs-8', baseTime: '13:00', currentTime: '13:00', durationMins: 60, delayMins: 0, title: 'Gift Distribution & Farewell', owner: 'MC — Suresh', vendorPhone: '+919900112233', dependencyNote: 'Kondapalli gift table at exit', status: 'upcoming' },
];

export const weddingGuests: Guest[] = [
  { id: 'g-1', name: 'Priya Sharma', phone: '+919800000001', dietary: 'jain', accessibilityTags: [], rsvpStatus: 'confirmed', plusOnes: 1 },
  { id: 'g-2', name: 'Rajan Menon', phone: '+919800000002', dietary: 'standard', accessibilityTags: ['wheelchair_ramp', 'ground_floor_room'], rsvpStatus: 'confirmed', plusOnes: 0 },
  { id: 'g-3', name: 'Lakshmi Auntie', phone: '+919800000003', dietary: 'vegan', accessibilityTags: ['elderly_seating', 'low_decibel_zone'], rsvpStatus: 'confirmed', plusOnes: 1 },
  { id: 'g-4', name: 'Anand Krishnamurthy', phone: '+919800000004', dietary: 'nut_free', accessibilityTags: [], rsvpStatus: 'pending', plusOnes: 2 },
  { id: 'g-5', name: 'Deepa Rao', phone: '+919800000005', dietary: 'standard', accessibilityTags: [], rsvpStatus: 'confirmed', plusOnes: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 2 — Inter-College Cultural Fest 'Aarohan' ₹4.2L
// ─────────────────────────────────────────────────────────────────────────────

export const festEvent: EventPlan = {
  id: 'aarohan-fest-2025',
  title: 'Aarohan Cultural Fest',
  category: 'college_fest',
  date: '2025-03-08',
  city: 'BIET Davangere',
  invitedCount: 1200,
  confirmedRsvpCount: 920,
  totalBudget: 420000,
  contingencyReservePercent: 10,
  activeWhatsappGroupsReplaced: 6,
};

export const festSuggestions: PlanSuggestion[] = [
  {
    id: 'fs-1',
    phase: 'Pre-Event',
    title: 'Main Stage Setup — Truss, LED Backdrop & PA System',
    estimatedCost: 95000,
    costRationale:
      'Stage hire for 600-pax college fest: ₹60–1.1L typical range. ₹95k covers a 24×16 ft truss stage, 6×3 m LED backdrop, and a 15k-watt PA system. Challenge tip: line-array systems are cheaper than cluster arrays for outdoor — ask vendors to quote both.',
    wasteImpact: 'Renting vs. buying prevents ~80 kg of electronic disposal waste.',
    accessibilityNote: 'Stage ramp must be ≥ 1 m wide, max 1:12 gradient. Confirm with vendor.',
    status: 'approved',
  },
  {
    id: 'fs-2',
    phase: 'Event Day',
    title: 'Food Stalls — College Canteen + 3 External Vendors',
    estimatedCost: 85000,
    costRationale:
      'Revenue-sharing model: collect ₹500 stall deposit × 8 stalls = ₹4k recovery. External stall fee of ₹8k/stall for 3 stalls = ₹24k. Remainder covers canteen restocking. Avoid flat-fee catering for fest format — revenue share aligns incentives.',
    wasteImpact: 'Mandate steel plates + reusable cups. Prevents ~35 kg single-use plastic.',
    accessibilityNote: 'One stall to maintain a low counter (≤85 cm) for wheelchair users.',
    status: 'pending',
  },
];

export const festBudget: BudgetLineItem[] = [
  {
    id: 'fb-1',
    category: 'Stage & AV',
    vendorName: 'StageCraft Events',
    quotedAmount: 95000,
    committedInstalments: 47500,
    projectedFinalInvoice: 103000,
    overrunRiskReason: 'Generator fuel and cable rigging often billed separately post-event.',
    quoteChallengeTip: 'Get an all-in quote including generator fuel, cable management, and 1-hr post-event dismantling.',
    backupVendorName: 'TechStage Solutions',
    backupVendorDelta: -8000,
    confirmationStatus: 'confirmed_24h',
    vendorPhone: '+919876501234',
  },
  {
    id: 'fb-2',
    category: 'Catering / Food Stalls',
    vendorName: 'Campus Canteen + Vendors',
    quotedAmount: 85000,
    committedInstalments: 24000,
    projectedFinalInvoice: 88000,
    overrunRiskReason: 'Higher-than-expected attendance triggers restocking cost.',
    quoteChallengeTip: 'Pre-negotiate restocking triggers: if footfall > 500, canteen gets additional ₹15k buffer automatically.',
    backupVendorName: 'QuickBite Catering',
    backupVendorDelta: 12000,
    confirmationStatus: 'pending_ping',
    vendorPhone: '+919845098765',
  },
];

export const festCatering: CateringMathModel = {
  invitedCount: 600,
  rsvpConfirmed: 420,
  p50ExpectedTurnout: 480,
  p90PeakTurnout: 560,
  blindBufferPlates: 690, // 600 × 1.15
  recommendedPlates: 560,
  perPlateCost: 120,
  jainPlates: 60,
  veganPlates: 45,
  allergySafePlates: 30,
  elderlySeatingCount: 15,
};

export const festScenarios: StressScenario[] = [
  {
    id: 'fsc-1',
    triggerType: 'monsoon_rain',
    title: 'Unexpected Rain During Outdoor Stage Performance',
    probability: 0.3,
    financialImpact: 22000,
    scheduleImpactMins: 20,
    backupVendorUsed: 'College Indoor Auditorium (free, 400 capacity)',
    recoveryChecklist: [
      'Immediately activate indoor auditorium — alert security to open',
      'Broadcast announcement from main stage before rain intensifies',
      'Pause outdoor performance; resume indoors in 20 mins',
      'Redirect food stalls to covered corridor',
      'Post updated venue map on college Instagram story',
    ],
    applied: false,
  },
  {
    id: 'fsc-2',
    triggerType: 'power_sound_delay',
    title: '45-Min Power Failure During Main Performance',
    probability: 0.2,
    financialImpact: 5000,
    scheduleImpactMins: 45,
    backupVendorUsed: 'Rental Generator (₹5k for 4hr)',
    recoveryChecklist: [
      'Switch to rental generator immediately',
      'MC keeps audience engaged with acoustic performance',
      'Cascade all show segments +45 mins',
      'Notify judges and performers via coordinator group',
      'Document power failure with timestamp for college authority claims',
    ],
    applied: false,
  },
  {
    id: 'fsc-3',
    triggerType: 'guest_surge_20',
    title: '+20% Gate Crashers / Uninvited Colleges',
    probability: 0.5,
    financialImpact: 18000,
    scheduleImpactMins: 10,
    backupVendorUsed: 'QuickBite Catering (on-call)',
    recoveryChecklist: [
      'Activate wristband-only entry protocol at gates',
      'Call QuickBite for emergency food top-up delivery',
      'Brief security to enforce capacity limit (600 max)',
      'Open standing-room overflow zone on east lawn',
      'Adjust food stall replenishment to every 30 mins',
    ],
    applied: false,
  },
  {
    id: 'fsc-4',
    triggerType: 'vendor_cancellation',
    title: 'DJ Cancels Day-of for Main Evening Dance Event',
    probability: 0.15,
    financialImpact: 12000,
    scheduleImpactMins: 30,
    backupVendorUsed: 'TechStage Solutions (has in-house DJ)',
    recoveryChecklist: [
      'Contact TechStage — they have in-house DJ for ₹12k',
      'Download backup playlist on Spotify (student organiser)',
      'Announce 30-min delay to audience; run quiz segment',
      'Get setlist from replaced DJ for continuity',
      'Document cancellation; pursue deposit refund',
    ],
    applied: false,
  },
];

export const festRunSheet: RunSheetItem[] = [
  { id: 'frs-1', baseTime: '09:00', currentTime: '09:00', durationMins: 60, delayMins: 0, title: 'Registration & Welcome Desk Open', owner: 'Student Council', vendorPhone: '+919900223344', dependencyNote: 'Gates open at 9 AM sharp', status: 'completed' },
  { id: 'frs-2', baseTime: '10:00', currentTime: '10:00', durationMins: 30, delayMins: 0, title: 'Inauguration & Chief Guest Address', owner: 'Principal + MC Arjun', vendorPhone: '+919900334455', dependencyNote: 'Chief guest confirmed at 9:45', status: 'live' },
  { id: 'frs-3', baseTime: '10:30', currentTime: '10:30', durationMins: 120, delayMins: 0, title: 'Competition Rounds — Dance, Music, Drama', owner: 'Judges Panel', vendorPhone: '+919900445566', dependencyNote: 'Three parallel tracks', status: 'upcoming' },
  { id: 'frs-4', baseTime: '13:00', currentTime: '13:00', durationMins: 60, delayMins: 0, title: 'Lunch Break — Food Stalls Open', owner: 'Campus Canteen', vendorPhone: '+919845098765', dependencyNote: 'Fire stalls at 12:45', status: 'upcoming' },
  { id: 'frs-5', baseTime: '14:00', currentTime: '14:00', durationMins: 120, delayMins: 0, title: 'Finals — Stage Performances', owner: 'MC Arjun', vendorPhone: '+919900334455', dependencyNote: 'Top 3 per category', status: 'upcoming' },
  { id: 'frs-6', baseTime: '16:00', currentTime: '16:00', durationMins: 60, delayMins: 0, title: 'Prize Distribution & Closing Ceremony', owner: 'Principal', vendorPhone: '+919900223344', dependencyNote: 'Judges submit results by 15:45', status: 'upcoming' },
  { id: 'frs-7', baseTime: '17:00', currentTime: '17:00', durationMins: 180, delayMins: 0, title: 'Evening DJ Night & Cultural Showcase', owner: 'DJ Karan / TechStage', vendorPhone: '+919876501234', dependencyNote: 'Stage transition: 30 min setup', status: 'upcoming' },
];

export const festGuests: Guest[] = [
  { id: 'fg-1', name: 'Arjun Nair', phone: '+919811000001', dietary: 'standard', accessibilityTags: [], rsvpStatus: 'confirmed', plusOnes: 0 },
  { id: 'fg-2', name: 'Kavya Reddy', phone: '+919811000002', dietary: 'vegan', accessibilityTags: [], rsvpStatus: 'confirmed', plusOnes: 0 },
  { id: 'fg-3', name: 'Rohan Gupta', phone: '+919811000003', dietary: 'jain', accessibilityTags: ['wheelchair_ramp'], rsvpStatus: 'pending', plusOnes: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRESET 3 — 50th Milestone Garden Gala ₹3.5L
// ─────────────────────────────────────────────────────────────────────────────

export const birthdayEvent: EventPlan = {
  id: 'milestone-50th-2025',
  title: 'Golden Jubilee Gala',
  category: 'milestone_birthday',
  date: '2025-04-19',
  city: 'Mysuru Garden',
  invitedCount: 80,
  confirmedRsvpCount: 65,
  totalBudget: 350000,
  contingencyReservePercent: 12,
  activeWhatsappGroupsReplaced: 3,
};

export const birthdaySuggestions: PlanSuggestion[] = [
  {
    id: 'bs-1',
    phase: 'Pre-Event',
    title: 'Intimate Garden Décor — String Lights & Floral Arches',
    estimatedCost: 55000,
    costRationale:
      'For 80-pax garden party in Mysuru, décor ranges ₹40–75k. ₹55k covers 200 m Edison string lights, 2 floral arches, and table centrepieces. Challenge: string lights are often marked up 3× — buy Edison bulb strands yourself from Amazon (₹800/10 m) and pay vendor only for installation labour (₹8k).',
    wasteImpact: 'Real flowers composted on-site; saves ~8 kg of floral waste going to landfill.',
    accessibilityNote: 'Garden path must have temporary flooring panels for wheelchair/walker access.',
    status: 'approved',
  },
  {
    id: 'bs-2',
    phase: 'Event Day',
    title: 'Sit-Down Dinner — Continental + South Indian Fusion',
    estimatedCost: 96000,
    costRationale:
      'At ₹1,200/plate for 80 guests = ₹96k. Mysuru market rate is ₹900–1,400/plate for sit-down service. Challenge: ask if this includes service staff (1 per 10 guests) — some caterers charge ₹500/server extra. Also confirm whether alcohol service is BYOB or vendor-supplied.',
    wasteImpact: 'Sit-down service generates 60% less food waste than buffet for ≤100 guests.',
    accessibilityNote: 'Reserve 8 ground-floor seats near main table for elderly guests; ensure chairs have armrests.',
    status: 'pending',
  },
];

export const birthdayBudget: BudgetLineItem[] = [
  {
    id: 'bb-1',
    category: 'Venue',
    vendorName: 'Lalitha Mahal Garden',
    quotedAmount: 85000,
    committedInstalments: 42500,
    projectedFinalInvoice: 90000,
    overrunRiskReason: 'Heritage venue charges extra ₹5k for post-10 PM extension.',
    quoteChallengeTip: 'Book until 11 PM in contract. Extension clause: ₹3k/hr (negotiate down from ₹5k).',
    backupVendorName: 'Mysuru Club Garden',
    backupVendorDelta: -15000,
    confirmationStatus: 'confirmed_24h',
    vendorPhone: '+919821123456',
  },
  {
    id: 'bb-2',
    category: 'Catering',
    vendorName: 'The Gourmet Table',
    quotedAmount: 96000,
    committedInstalments: 48000,
    projectedFinalInvoice: 102000,
    overrunRiskReason: 'Sit-down service for 80 often rounds up to 90 minimum-guarantee clause.',
    quoteChallengeTip: 'Negotiate minimum guarantee at 75 guests (10% below invited). Get in writing.',
    backupVendorName: 'Mysuru Kitchen Co.',
    backupVendorDelta: 8000,
    confirmationStatus: 'pending_ping',
    vendorPhone: '+919821234567',
  },
  {
    id: 'bb-3',
    category: 'Décor',
    vendorName: 'Garden Tales Decor',
    quotedAmount: 55000,
    committedInstalments: 27500,
    projectedFinalInvoice: 57000,
    overrunRiskReason: 'String light cost varies with season — April prices peak due to summer weddings.',
    quoteChallengeTip: 'Buy Edison strands from Amazon yourself. Pay vendor ₹8k for installation only.',
    backupVendorName: 'Blooms & Beyond Mysuru',
    backupVendorDelta: -5000,
    confirmationStatus: 'at_risk',
    vendorPhone: '+919821345678',
  },
];

export const birthdayCatering: CateringMathModel = {
  invitedCount: 80,
  rsvpConfirmed: 65,
  p50ExpectedTurnout: 62,
  p90PeakTurnout: 72,
  blindBufferPlates: 92, // 80 × 1.15
  recommendedPlates: 72,
  perPlateCost: 1200,
  jainPlates: 10,
  veganPlates: 6,
  allergySafePlates: 4,
  elderlySeatingCount: 12,
};

export const birthdayScenarios: StressScenario[] = [
  {
    id: 'bsc-1',
    triggerType: 'monsoon_rain',
    title: 'Unexpected April Rain on Garden Venue',
    probability: 0.2,
    financialImpact: 18000,
    scheduleImpactMins: 20,
    backupVendorUsed: 'Lalitha Mahal Indoor Hall (included in venue fee)',
    recoveryChecklist: [
      'Move dinner service to indoor hall — Lalitha Mahal has 100-pax indoor capacity',
      'Inform guests 30 mins before rain arrival via WhatsApp',
      'Shift string lights to covered pergola area',
      'Keep garden access for photos during dry windows',
      'Adjust catering serving setup to indoor configuration',
    ],
    applied: false,
  },
  {
    id: 'bsc-2',
    triggerType: 'vendor_cancellation',
    title: 'Caterer Cancels 48 Hours Before Gala',
    probability: 0.1,
    financialImpact: 15000,
    scheduleImpactMins: 0,
    backupVendorUsed: 'Mysuru Kitchen Co. (+₹8k vs primary)',
    recoveryChecklist: [
      'Contact Mysuru Kitchen Co. immediately with full menu brief',
      'Transfer dietary requirements list (Jain/Vegan/Allergy)',
      'Confirm sit-down service capability for 80 guests',
      'Request ₹48k deposit refund from primary caterer',
      'Brief backup vendor on elderly-friendly serving (armrest chairs)',
    ],
    applied: false,
  },
  {
    id: 'bsc-3',
    triggerType: 'guest_surge_20',
    title: '+20% Walk-in Guests (16 extra)',
    probability: 0.3,
    financialImpact: 19200,
    scheduleImpactMins: 0,
    backupVendorUsed: 'Mysuru Kitchen Co. (on-call for surge plates)',
    recoveryChecklist: [
      'Activate caterer surge clause — add 16 plates at ₹1,200 each',
      'Set up additional table in garden overflow section',
      'Ensure accessibility path remains unobstructed',
      'Update DJ/entertainment MC on revised headcount',
    ],
    applied: false,
  },
  {
    id: 'bsc-4',
    triggerType: 'power_sound_delay',
    title: '45-Min Power Dip During Evening Programme',
    probability: 0.15,
    financialImpact: 3000,
    scheduleImpactMins: 45,
    backupVendorUsed: 'Portable Inverter (self-arranged, ₹3k rental)',
    recoveryChecklist: [
      'Switch ambient lighting to battery-powered LED candles (pre-placed)',
      'Venue DG set should kick in within 5 minutes — follow up',
      'Background acoustic music to fill the gap',
      'Cascade dinner service +45 mins',
      'Check DG set fuel level for rest of evening',
    ],
    applied: false,
  },
];

export const birthdayRunSheet: RunSheetItem[] = [
  { id: 'brs-1', baseTime: '17:00', currentTime: '17:00', durationMins: 60, delayMins: 0, title: 'Guest Arrival & Garden Walk', owner: 'Host Family', vendorPhone: '+919821123456', dependencyNote: 'Venue gates open at 5 PM', status: 'completed' },
  { id: 'brs-2', baseTime: '18:00', currentTime: '18:00', durationMins: 30, delayMins: 0, title: 'Welcome Toast & Birthday Cake Ceremony', owner: 'Host — Ramesh Ji', vendorPhone: '', dependencyNote: 'Cake delivery at 17:45', status: 'live' },
  { id: 'brs-3', baseTime: '18:30', currentTime: '18:30', durationMins: 90, delayMins: 0, title: 'Sit-Down Dinner Service', owner: 'The Gourmet Table', vendorPhone: '+919821234567', dependencyNote: 'Fire first course at 18:25', status: 'upcoming' },
  { id: 'brs-4', baseTime: '20:00', currentTime: '20:00', durationMins: 60, delayMins: 0, title: 'Live Music & Garden Stroll', owner: 'Acoustic Duo', vendorPhone: '+919821456789', dependencyNote: 'After dinner', status: 'upcoming' },
  { id: 'brs-5', baseTime: '21:00', currentTime: '21:00', durationMins: 60, delayMins: 0, title: 'Speeches, Memories & Photo Slideshow', owner: 'MC — Priya (daughter)', vendorPhone: '', dependencyNote: 'Projector setup at 20:45', status: 'upcoming' },
  { id: 'brs-6', baseTime: '22:00', currentTime: '22:00', durationMins: 30, delayMins: 0, title: 'Farewell & Gift Distribution', owner: 'Host Family', vendorPhone: '', dependencyNote: 'Return gifts at exit table', status: 'upcoming' },
];

export const birthdayGuests: Guest[] = [
  { id: 'bg-1', name: 'Ramesh & Meena (hosts)', phone: '+919821111111', dietary: 'standard', accessibilityTags: ['elderly_seating'], rsvpStatus: 'confirmed', plusOnes: 0 },
  { id: 'bg-2', name: 'Dr. Krishnaswamy', phone: '+919821222222', dietary: 'jain', accessibilityTags: ['wheelchair_ramp', 'ground_floor_room'], rsvpStatus: 'confirmed', plusOnes: 1 },
  { id: 'bg-3', name: 'Sunita Acharya', phone: '+919821333333', dietary: 'vegan', accessibilityTags: ['low_decibel_zone'], rsvpStatus: 'confirmed', plusOnes: 0 },
  { id: 'bg-4', name: 'Harsha Gowda', phone: '+919821444444', dietary: 'nut_free', accessibilityTags: [], rsvpStatus: 'pending', plusOnes: 3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRESET MAP
// ─────────────────────────────────────────────────────────────────────────────

export type PresetKey = 'wedding' | 'fest' | 'birthday';

export const PRESETS: Record<PresetKey, {
  event: EventPlan;
  suggestions: PlanSuggestion[];
  budget: BudgetLineItem[];
  catering: CateringMathModel;
  scenarios: StressScenario[];
  runSheet: RunSheetItem[];
  guests: Guest[];
  label: string;
  emoji: string;
  subtitle: string;
}> = {
  wedding: {
    event: weddingEvent,
    suggestions: weddingSuggestions,
    budget: weddingBudget,
    catering: weddingCatering,
    scenarios: weddingScenarios,
    runSheet: weddingRunSheet,
    guests: weddingGuests,
    label: 'Royal Courtyard Wedding',
    emoji: '🌿',
    subtitle: 'Bengaluru · ₹18.5L · 250 Guests',
  },
  fest: {
    event: festEvent,
    suggestions: festSuggestions,
    budget: festBudget,
    catering: festCatering,
    scenarios: festScenarios,
    runSheet: festRunSheet,
    guests: festGuests,
    label: 'Aarohan Cultural Fest',
    emoji: '⚡',
    subtitle: 'BIET Davangere · ₹4.2L · 1,200 Attendees',
  },
  birthday: {
    event: birthdayEvent,
    suggestions: birthdaySuggestions,
    budget: birthdayBudget,
    catering: birthdayCatering,
    scenarios: birthdayScenarios,
    runSheet: birthdayRunSheet,
    guests: birthdayGuests,
    label: 'Golden Jubilee Gala',
    emoji: '✨',
    subtitle: 'Mysuru Garden · ₹3.5L · 80 Guests',
  },
};
