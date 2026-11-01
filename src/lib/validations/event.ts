import { z } from 'zod';

export const EventCategorySchema = z.enum(['wedding', 'college_fest', 'milestone_birthday', 'celebration', 'other']);

export const EventPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  category: EventCategorySchema,
  date: z.string().min(4, 'Valid date is required'),
  city: z.string().min(2, 'City is required'),
  invitedCount: z.number().int().nonnegative().default(0),
  confirmedRsvpCount: z.number().int().nonnegative().default(0),
  totalBudget: z.number().int().positive('Budget must be positive'),
  contingencyReservePercent: z.number().min(0).max(100).default(10),
  activeWhatsappGroupsReplaced: z.number().int().nonnegative().default(0),
});

export const CreateEventSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(120),
  category: EventCategorySchema,
  date: z.string().min(4, 'Valid date is required'),
  city: z.string().min(2, 'City is required'),
  invitedCount: z.number().int().nonnegative().default(0),
  totalBudget: z.number().int().positive('Total budget must be a positive integer'),
  contingencyReservePercent: z.number().min(0).max(100).default(10),
  activeWhatsappGroupsReplaced: z.number().int().nonnegative().default(0),
});

export const UpdateEventSchema = CreateEventSchema.partial().omit({ id: true });

export const DietaryTypeSchema = z.enum(['standard', 'jain', 'vegan', 'nut_free']);

export const AccessibilityTagSchema = z.enum([
  'wheelchair_ramp',
  'ground_floor_room',
  'elderly_seating',
  'low_decibel_zone',
]);

export const RsvpStatusSchema = z.enum(['confirmed', 'pending', 'declined']);

// Public RSVP submission requires explicit eventId (NO fallback)
export const PublicRsvpSubmissionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  name: z.string().min(1, 'Guest name is required').max(100),
  phone: z
    .string()
    .min(5, 'Valid phone number is required')
    .max(25)
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format'),
  dietary: DietaryTypeSchema.default('standard'),
  accessibilityTags: z.array(AccessibilityTagSchema).default([]),
  rsvpStatus: RsvpStatusSchema.default('confirmed'),
  partySize: z.number().int().min(1).max(20).default(1),
  notes: z.string().max(500).optional().default(''),
  language: z.enum(['en', 'hi', 'kn']).default('en'),
});

// Alias for backwards compatibility
export const GuestSubmissionSchema = PublicRsvpSubmissionSchema;

export const CreateGuestSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1, 'Guest name is required').max(100),
  phone: z
    .string()
    .min(5, 'Valid phone number is required')
    .max(25)
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format'),
  dietary: DietaryTypeSchema.default('standard'),
  accessibilityTags: z.array(AccessibilityTagSchema).default([]),
  rsvpStatus: RsvpStatusSchema.default('pending'),
  plusOnes: z.number().int().nonnegative().max(19).default(0),
  notes: z.string().max(500).optional().default(''),
});

export const UpdateGuestSchema = z.object({
  name: z.string().min(1, 'Guest name is required').max(100).optional(),
  phone: z
    .string()
    .min(5, 'Valid phone number is required')
    .max(25)
    .regex(/^[+0-9\s\-()]+$/, 'Invalid phone number format')
    .optional(),
  dietary: DietaryTypeSchema.optional(),
  accessibilityTags: z.array(AccessibilityTagSchema).optional(),
  rsvpStatus: RsvpStatusSchema.optional(),
  plusOnes: z.number().int().nonnegative().max(19).optional(),
  notes: z.string().max(500).optional(),
});

export const CreateBudgetItemSchema = z.object({
  id: z.string().min(1).optional(),
  category: z.string().min(1, 'Category is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  quotedAmount: z.number().int().nonnegative().default(0),
  committedInstalments: z.number().int().nonnegative().default(0),
  projectedFinalInvoice: z.number().int().nonnegative().default(0),
  overrunRiskReason: z.string().optional().default(''),
  quoteChallengeTip: z.string().optional().default(''),
  backupVendorName: z.string().optional().default(''),
  backupVendorDelta: z.number().int().default(0),
  confirmationStatus: z.enum(['confirmed_24h', 'pending_ping', 'at_risk']).default('pending_ping'),
  vendorPhone: z.string().optional().default(''),
});

// Alias for domain schema validation
export const BudgetItemSchema = CreateBudgetItemSchema.extend({
  id: z.string().min(1),
  eventId: z.string().min(1),
});

export const UpdateBudgetItemSchema = z.object({
  category: z.string().min(1).optional(),
  vendorName: z.string().min(1).optional(),
  quotedAmount: z.number().int().nonnegative().optional(),
  committedInstalments: z.number().int().nonnegative().optional(),
  projectedFinalInvoice: z.number().int().nonnegative().optional(),
  overrunRiskReason: z.string().optional(),
  quoteChallengeTip: z.string().optional(),
  backupVendorName: z.string().optional(),
  backupVendorDelta: z.number().int().optional(),
  confirmationStatus: z.enum(['confirmed_24h', 'pending_ping', 'at_risk']).optional(),
  vendorPhone: z.string().optional(),
});

export const CreateTimelineItemSchema = z.object({
  id: z.string().min(1).optional(),
  baseTime: z.string().min(3, 'Base time is required'),
  currentTime: z.string().min(3).optional(),
  durationMins: z.number().int().nonnegative().default(0),
  delayMins: z.number().int().default(0),
  title: z.string().min(1, 'Title is required'),
  owner: z.string().min(1, 'Owner is required'),
  vendorPhone: z.string().optional().default(''),
  dependencyNote: z.string().optional().default(''),
  status: z.enum(['completed', 'live', 'upcoming', 'delayed']).default('upcoming'),
});

export const UpdateTimelineItemSchema = z.object({
  baseTime: z.string().min(3).optional(),
  currentTime: z.string().min(3).optional(),
  durationMins: z.number().int().nonnegative().optional(),
  delayMins: z.number().int().optional(),
  title: z.string().min(1).optional(),
  owner: z.string().min(1).optional(),
  vendorPhone: z.string().optional(),
  dependencyNote: z.string().optional(),
  status: z.enum(['completed', 'live', 'upcoming', 'delayed']).optional(),
});

export const StakeholderVoteSubmissionSchema = z.object({
  suggestionId: z.string().min(1, 'Suggestion ID is required'),
  stakeholderRole: z.enum(['parents', 'couple', 'logistics']),
  vote: z.string().min(1, 'Vote value is required'),
  voterName: z.string().optional().default(''),
  comments: z.string().optional().default(''),
});

export const AIChatMessageSchema = z.object({
  sender: z.enum(['user', 'assistant']),
  text: z.string().max(4000),
});

export const AIChatEndpointSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt exceeds 1000 characters limit'),
  history: z.array(AIChatMessageSchema).max(10).optional().default([]),
  language: z.enum(['en', 'hi', 'kn']).optional().default('en'),
});

export const AIChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  context: z.record(z.string(), z.unknown()).optional(),
});
