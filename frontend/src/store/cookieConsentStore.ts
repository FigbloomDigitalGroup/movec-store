import { create } from 'zustand';

interface CookieConsent {
  analytics: boolean;
  decidedAt: string | null;
}

interface CookieConsentState {
  analytics: boolean;
  decidedAt: string | null;
  showBanner: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (analytics: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const STORAGE_KEY = 'cookieConsent';

function readStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(consent: CookieConsent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

const stored = readStoredConsent();

export const useCookieConsentStore = create<CookieConsentState>((set) => ({
  analytics: stored?.analytics ?? false,
  decidedAt: stored?.decidedAt ?? null,
  showBanner: !stored,

  acceptAll: () => {
    const decidedAt = new Date().toISOString();
    persist({ analytics: true, decidedAt });
    set({ analytics: true, decidedAt, showBanner: false });
  },

  rejectNonEssential: () => {
    const decidedAt = new Date().toISOString();
    persist({ analytics: false, decidedAt });
    set({ analytics: false, decidedAt, showBanner: false });
  },

  savePreferences: (analytics) => {
    const decidedAt = new Date().toISOString();
    persist({ analytics, decidedAt });
    set({ analytics, decidedAt, showBanner: false });
  },

  openSettings: () => set({ showBanner: true }),
  closeSettings: () => set({ showBanner: false }),
}));
