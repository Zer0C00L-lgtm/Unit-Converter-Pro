export type ConversionDirection = 'km_to_mi' | 'mi_to_km';

export interface ConversionRecord {
  id: string;
  timestamp: number;
  inputValue: number;
  inputUnit: 'km' | 'mi';
  outputValue: number;
  outputUnit: 'km' | 'mi';
  precision: number;
  formula: string;
  note?: string;
  userId: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  lastLogin: number;
  defaultPrecision: number;
  defaultDirection: ConversionDirection;
  isGuest?: boolean;
}

export interface ConversionPreset {
  label: string;
  description: string;
  value: number;
  direction: ConversionDirection;
  category: 'running' | 'driving' | 'aviation' | 'everyday';
}

export interface ConversionStats {
  totalCount: number;
  kmToMiCount: number;
  miToKmCount: number;
  totalKmConverted: number;
  totalMiConverted: number;
}
