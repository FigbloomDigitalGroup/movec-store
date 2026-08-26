// Mirrors the backend InstallationTimeSlot enum (backend/prisma/schema.prisma).
export const TIME_SLOTS = [
  { id: 'MORNING', label: 'Morning', window: '9am – 11am' },
  { id: 'MIDDAY', label: 'Midday', window: '11am – 1pm' },
  { id: 'AFTERNOON', label: 'Afternoon', window: '1pm – 3pm' },
  { id: 'EVENING', label: 'Evening', window: '3pm – 5pm' },
] as const;

export function formatTimeSlot(timeSlot: string | null | undefined): string | null {
  const slot = TIME_SLOTS.find((s) => s.id === timeSlot);
  return slot ? `${slot.label} (${slot.window})` : null;
}
