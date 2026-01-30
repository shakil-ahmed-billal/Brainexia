export const SERVICE_TYPES = [
  { value: "WEB", label: "Web Development" },
  { value: "SEO", label: "SEO" },
  { value: "MARKETING", label: "Marketing" },
  { value: "DESIGN", label: "Design" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "CONSULTING", label: "Consulting" },
  { value: "OTHER", label: "Other" },
] as const;

export const SERVICE_STATUSES = [
  { value: "INTERESTED", label: "Interested" },
  { value: "CONVERTED", label: "Converted" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
] as const;

export const MESSAGE_CHANNELS = [
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
] as const;

export const AI_TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "confident", label: "Confident" },
  { value: "soft sales", label: "Soft Sales" },
] as const;

export const AI_MODES = [
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "warm_followup", label: "Warm Follow-up" },
  { value: "conversion_push", label: "Conversion Push" },
  { value: "reminder", label: "Reminder" },
  { value: "friendly_checkin", label: "Friendly Check-in" },
] as const;

export const LEAD_SOURCES = [
  "Facebook",
  "Website",
  "Referral",
  "LinkedIn",
  "Offline",
  "Other",
] as const;
