import { IntakeAnswers, Provider, Referral, CareRouteResult, CarePacket, FollowUpResult } from './types';

const STORAGE_KEYS = {
  role: 'wisecare.role',
  intake: 'wisecare.intake',
  intakeStep: 'wisecare.intakeStep',
  saved: 'wisecare.saved',
  followup: 'wisecare.followup',
  sentRequests: 'wisecare.sentRequests',
  careRoute: 'wisecare.careRoute',
  carePacket: 'wisecare.carePacket',
  providers: 'wisecare.providers',
  referrals: 'wisecare.referrals',
};

// Safe access helper
const isBrowser = typeof window !== 'undefined';

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch {
    // If it's not JSON, return as string if type matches, or fallback
    return (item as unknown) as T;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  if (typeof value === 'string') {
    localStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function removeStorageItem(key: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}

// Typed wrapper functions
export const storage = {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getRole: () => {
    if (!isBrowser) return 'user';
    return localStorage.getItem(STORAGE_KEYS.role) || 'user';
  },
  setRole: (role: string) => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.role, role);
  },
  
  getIntake: (): Partial<IntakeAnswers> => {
    return getStorageItem<Partial<IntakeAnswers>>(STORAGE_KEYS.intake, {});
  },
  setIntake: (answers: Partial<IntakeAnswers>) => {
    setStorageItem(STORAGE_KEYS.intake, answers);
  },
  
  getIntakeStep: (): number => {
    const step = getStorageItem<string>(STORAGE_KEYS.intakeStep, '0');
    return parseInt(step, 10) || 0;
  },
  setIntakeStep: (step: number) => {
    setStorageItem(STORAGE_KEYS.intakeStep, String(step));
  },

  getSavedProviders: (): string[] => {
    return getStorageItem<string[]>(STORAGE_KEYS.saved, []);
  },
  saveProvider: (id: string) => {
    const list = new Set(storage.getSavedProviders());
    list.add(id);
    setStorageItem(STORAGE_KEYS.saved, [...list]);
  },
  unsaveProvider: (id: string) => {
    const list = new Set(storage.getSavedProviders());
    list.delete(id);
    setStorageItem(STORAGE_KEYS.saved, [...list]);
  },

  getSentRequests: (): string[] => {
    return getStorageItem<string[]>(STORAGE_KEYS.sentRequests, []);
  },
  addSentRequest: (providerId: string) => {
    const list = new Set(storage.getSentRequests());
    list.add(providerId);
    setStorageItem(STORAGE_KEYS.sentRequests, [...list]);
  },

  getCareRoute: (): CareRouteResult | null => {
    return getStorageItem<CareRouteResult | null>(STORAGE_KEYS.careRoute, null);
  },
  setCareRoute: (route: CareRouteResult) => {
    setStorageItem(STORAGE_KEYS.careRoute, route);
  },

  getCarePacket: (): CarePacket | null => {
    return getStorageItem<CarePacket | null>(STORAGE_KEYS.carePacket, null);
  },
  setCarePacket: (packet: CarePacket) => {
    setStorageItem(STORAGE_KEYS.carePacket, packet);
  },

  getReferrals: (): Referral[] => {
    // Dynamic referrals list for provider view, falling back to mockReferrals if not set
    return getStorageItem<Referral[]>(STORAGE_KEYS.referrals, []);
  },
  setReferrals: (referrals: Referral[]) => {
    setStorageItem(STORAGE_KEYS.referrals, referrals);
  },
};
