import { ConversionDirection } from '@/types/converter';
import { KM_TO_MILE_FACTOR, MILE_TO_KM_EXACT, formatPrecision } from './converter';
import { ToastPayload } from '@/components/Toast';

export interface MilestoneDefinition {
  id: string;
  name: string;
  km: number;
  mi: number;
  toleranceKm: number;
  toleranceMi: number;
  badge: string;
  title: string;
  message: string;
  iconType: 'trophy' | 'zap' | 'compass' | 'globe';
}

export const SIGNIFICANT_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'milestone_5k',
    name: '5K Road Race',
    km: 5,
    mi: 3.10686,
    toleranceKm: 0.05,
    toleranceMi: 0.04,
    badge: '5K Milestone',
    title: '🏃 5K Parkrun Milestone Reached',
    message: 'Evaluated official 5,000m road race distance (5.0 km ≈ 3.11 mi)!',
    iconType: 'trophy',
  },
  {
    id: 'milestone_10k',
    name: '10K Benchmark',
    km: 10,
    mi: 6.21371,
    toleranceKm: 0.08,
    toleranceMi: 0.05,
    badge: '10K Benchmark',
    title: '🏅 10K Athletic Benchmark Reached',
    message: 'Classic 10-kilometer road race standard verified (10.0 km ≈ 6.21 mi)!',
    iconType: 'trophy',
  },
  {
    id: 'milestone_half_marathon',
    name: 'Half Marathon',
    km: 21.0975,
    mi: 13.1094,
    toleranceKm: 0.15,
    toleranceMi: 0.1,
    badge: 'Half Marathon',
    title: '🥇 Half Marathon Distance Verified',
    message: 'Official 21.0975 km / 13.11 mi half-marathon mark achieved!',
    iconType: 'trophy',
  },
  {
    id: 'milestone_marathon',
    name: 'Full Marathon',
    km: 42.195,
    mi: 26.21875,
    toleranceKm: 0.25,
    toleranceMi: 0.15,
    badge: 'Official Marathon',
    title: '🏆 Official Marathon Distance Reached',
    message: 'Full Olympic 42.195 km / 26.22 mi marathon standard evaluated!',
    iconType: 'trophy',
  },
  {
    id: 'milestone_100k',
    name: '100K Ultramarathon',
    km: 100,
    mi: 62.1371,
    toleranceKm: 0.5,
    toleranceMi: 0.3,
    badge: '100K Ultra',
    title: '⚡ 100K Ultramarathon Benchmark',
    message: 'Triple-digit 100 km ultra endurance distance reached (100 km ≈ 62.14 mi)!',
    iconType: 'zap',
  },
  {
    id: 'milestone_century_100m',
    name: '100-Mile Century',
    km: 160.9344,
    mi: 100,
    toleranceKm: 0.8,
    toleranceMi: 0.5,
    badge: 'Century 100-Mi',
    title: '🚴 100-Mile Century Endurance Standard',
    message: 'Historic 100 miles / Western States century mark verified (100 mi = 160.93 km)!',
    iconType: 'trophy',
  },
];

export interface DistanceThresholdDefinition {
  id: string;
  minKm: number;
  minMi: number;
  title: string;
  badge: string;
  iconType: 'zap' | 'compass' | 'globe';
  generateMessage: (val: number, unit: string, outVal: number, outUnit: string) => string;
}

export const DISTANCE_SCALE_THRESHOLDS: DistanceThresholdDefinition[] = [
  {
    id: 'thresh_lunar',
    minKm: 384400,
    minMi: 238855,
    title: '🌕 Lunar Orbit Threshold Reached!',
    badge: 'Cosmic Scale',
    iconType: 'globe',
    generateMessage: (val, unit, outVal, outUnit) =>
      `${val.toLocaleString()} ${unit} (≈ ${outVal.toLocaleString()} ${outUnit}) exceeds the average distance from Earth to the Moon (384,400 km)!`,
  },
  {
    id: 'thresh_earth_circ',
    minKm: 40075,
    minMi: 24901,
    title: '🪐 Planetary Circumference Exceeded!',
    badge: 'Planetary Scale',
    iconType: 'globe',
    generateMessage: (val, unit, outVal, outUnit) =>
      `${val.toLocaleString()} ${unit} exceeds the entire equatorial circumference of planet Earth (40,075 km / 24,901 mi)!`,
  },
  {
    id: 'thresh_10000',
    minKm: 10000,
    minMi: 6213.71,
    title: '🚀 Global Quarter Scale (>10,000 km)',
    badge: 'Global Scale',
    iconType: 'globe',
    generateMessage: (val, unit, outVal, outUnit) =>
      `Intercontinental scale: ${val.toLocaleString()} ${unit} (≈ ${outVal.toLocaleString()} ${outUnit}) spans more than a quarter of the globe!`,
  },
  {
    id: 'thresh_1000',
    minKm: 1000,
    minMi: 621.371,
    title: '🌐 Transcontinental Distance (>1,000 km)',
    badge: 'Continental Threshold',
    iconType: 'compass',
    generateMessage: (val, unit, outVal, outUnit) =>
      `Significant continental transit: ${val.toLocaleString()} ${unit} equals ${outVal.toLocaleString()} ${outUnit}!`,
  },
  {
    id: 'thresh_500',
    minKm: 500,
    minMi: 310.686,
    title: '✈️ Regional Transit Threshold (>500 km)',
    badge: 'Regional Scale',
    iconType: 'compass',
    generateMessage: (val, unit, outVal, outUnit) =>
      `Major intercity transit scale: ${val.toLocaleString()} ${unit} converts to ${outVal.toLocaleString()} ${outUnit}.`,
  },
];

export interface ThresholdEvaluationResult {
  hasAlert: boolean;
  alertType: 'milestone' | 'threshold' | null;
  payload: ToastPayload | null;
  triggerKey: string | null;
}

/**
 * Evaluates whether an active conversion matches a significant milestone or exceeds scale thresholds.
 */
export function evaluateConversionAlert(
  inputValue: number,
  direction: ConversionDirection,
  precision: number,
  customThreshold?: { enabled: boolean; value: number }
): ThresholdEvaluationResult {
  if (!isFinite(inputValue) || inputValue <= 0) {
    return { hasAlert: false, alertType: null, payload: null, triggerKey: null };
  }

  const isKm = direction === 'km_to_mi';
  const inputUnit = isKm ? 'km' : 'mi';
  const outputUnit = isKm ? 'mi' : 'km';
  const outputValue = isKm ? inputValue * KM_TO_MILE_FACTOR : inputValue * MILE_TO_KM_EXACT;
  const kmValue = isKm ? inputValue : outputValue;
  const miValue = isKm ? outputValue : inputValue;

  // 1. Check custom user-defined threshold first if enabled
  if (customThreshold && customThreshold.enabled && customThreshold.value > 0) {
    if (inputValue >= customThreshold.value) {
      const triggerKey = `custom_${customThreshold.value}_${Math.floor(inputValue)}`;
      return {
        hasAlert: true,
        alertType: 'threshold',
        triggerKey,
        payload: {
          title: `🚨 Custom Threshold Exceeded (≥ ${customThreshold.value} ${inputUnit})`,
          message: `${formatPrecision(inputValue, 2)} ${inputUnit} = ${formatPrecision(outputValue, precision === -1 ? 4 : precision)} ${outputUnit} meets your alert limit.`,
          type: 'threshold',
          badge: `Alert: ${customThreshold.value} ${inputUnit}`,
          iconType: 'zap',
          duration: 4500,
        },
      };
    }
  }

  // 2. Check exact athletic distance milestones
  for (const m of SIGNIFICANT_MILESTONES) {
    const isMatched = isKm
      ? Math.abs(inputValue - m.km) <= m.toleranceKm
      : Math.abs(inputValue - m.mi) <= m.toleranceMi;

    if (isMatched) {
      return {
        hasAlert: true,
        alertType: 'milestone',
        triggerKey: `milestone_${m.id}`,
        payload: {
          title: m.title,
          message: m.message,
          type: 'milestone',
          badge: m.badge,
          iconType: m.iconType,
          duration: 5000,
        },
      };
    }
  }

  // 3. Check macro distance thresholds (ordered highest to lowest)
  for (const t of DISTANCE_SCALE_THRESHOLDS) {
    if (kmValue >= t.minKm || miValue >= t.minMi) {
      // Create bracket key so notification fires once per scale tier
      const triggerKey = `tier_${t.id}`;
      return {
        hasAlert: true,
        alertType: 'threshold',
        triggerKey,
        payload: {
          title: t.title,
          message: t.generateMessage(
            Math.round(inputValue * 100) / 100,
            inputUnit,
            Math.round(outputValue * 100) / 100,
            outputUnit
          ),
          type: 'threshold',
          badge: t.badge,
          iconType: t.iconType,
          duration: 4500,
        },
      };
    }
  }

  return { hasAlert: false, alertType: null, payload: null, triggerKey: null };
}
