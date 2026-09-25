import { CropField, LivestockGroup, Machine, ActivityLog, FarmUser } from '../types';
import { INITIAL_USER, INITIAL_CROPS, INITIAL_LIVESTOCK, INITIAL_MACHINES, INITIAL_ACTIVITIES } from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'agrocontro_user',
  CROPS: 'agrocontro_crops',
  LIVESTOCK: 'agrocontro_livestock',
  MACHINES: 'agrocontro_machines',
  ACTIVITIES: 'agrocontro_activities',
};

export const StorageService = {
  getUser(): FarmUser {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
      return INITIAL_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USER;
    }
  },

  saveUser(user: FarmUser): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getCrops(): CropField[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CROPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
      return INITIAL_CROPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CROPS;
    }
  },

  saveCrops(crops: CropField[]): void {
    localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
  },

  getLivestock(): LivestockGroup[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVESTOCK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LIVESTOCK, JSON.stringify(INITIAL_LIVESTOCK));
      return INITIAL_LIVESTOCK;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LIVESTOCK;
    }
  },

  saveLivestock(livestock: LivestockGroup[]): void {
    localStorage.setItem(STORAGE_KEYS.LIVESTOCK, JSON.stringify(livestock));
  },

  getMachines(): Machine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MACHINES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(INITIAL_MACHINES));
      return INITIAL_MACHINES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MACHINES;
    }
  },

  saveMachines(machines: Machine[]): void {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  },

  getActivities(): ActivityLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },

  saveActivities(activities: ActivityLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  clearActivities(): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
  },

  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER));
    localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
    localStorage.setItem(STORAGE_KEYS.LIVESTOCK, JSON.stringify(INITIAL_LIVESTOCK));
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(INITIAL_MACHINES));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  },
};
