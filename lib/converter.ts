import { ConversionDirection, ConversionPreset, ConversionRecord } from '@/types/converter';

// Constants defined by international standards (1959 international yard and pound agreement)
// 1 international mile = exactly 1,609.344 meters = 1.609344 kilometers
export const MILE_TO_KM_EXACT = 1.609344;
// 1 kilometer = 1 / 1.609344 miles ≈ 0.621371192237334
export const KM_TO_MILE_FACTOR = 1 / MILE_TO_KM_EXACT;

export interface ConversionResult {
  inputValue: number;
  inputUnit: 'km' | 'mi';
  outputValue: number;
  outputUnit: 'km' | 'mi';
  formattedResult: string;
  formula: string;
  stepByStep: string[];
  scientificNotation: string;
  approximateFraction: string;
}

export function validateNumericInput(input: string): {
  isValid: boolean;
  error?: string;
  numericValue?: number;
} {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { isValid: false, error: 'Please enter a number' };
  }

  // Check for non-numeric characters (allow valid floats, scientific notation)
  // Clean comma if used as decimal separator
  const sanitized = trimmed.replace(',', '.');
  const num = Number(sanitized);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Invalid input. Please enter numbers only (e.g. 5, 42.195, 100).',
    };
  }

  if (!isFinite(num)) {
    return {
      isValid: false,
      error: 'Value is out of computational range (infinity).',
    };
  }

  return {
    isValid: true,
    numericValue: num,
  };
}

// Convert numbers with configurable decimal precision or exact formatting
export function formatPrecision(value: number, precision: number): string {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return '0';
  }
  if (
    precision === -1 ||
    precision === undefined ||
    precision === null ||
    isNaN(precision) ||
    precision < 0
  ) {
    // Exact or max precision without trailing zeros
    const str = Number(value.toFixed(10)).toString();
    return str;
  }
  const safePrecision = Math.max(0, Math.min(20, Math.floor(precision)));
  return value.toLocaleString('en-US', {
    minimumFractionDigits: safePrecision,
    maximumFractionDigits: safePrecision,
  });
}

export function convertDistance(
  value: number,
  direction: ConversionDirection,
  precision: number = 4
): ConversionResult {
  if (direction === 'km_to_mi') {
    const rawOutput = value * KM_TO_MILE_FACTOR;
    const formatted = formatPrecision(rawOutput, precision);
    const stepByStep = [
      `1. Base formula: Miles = Kilometers × ${KM_TO_MILE_FACTOR.toFixed(6)} (or ÷ ${MILE_TO_KM_EXACT})`,
      `2. Substitute input: ${value} km × ${KM_TO_MILE_FACTOR.toFixed(8)}`,
      `3. Exact product: ${rawOutput.toFixed(10)} mi`,
      `4. Rounded to ${precision === -1 ? 'exact' : precision + ' decimal places'}: ${formatted} mi`,
    ];

    return {
      inputValue: value,
      inputUnit: 'km',
      outputValue: rawOutput,
      outputUnit: 'mi',
      formattedResult: formatted,
      formula: `${value} km × 0.621371 = ${formatted} mi`,
      stepByStep,
      scientificNotation: rawOutput.toExponential(4),
      approximateFraction: getApproximateRatio(value, rawOutput),
    };
  } else {
    const rawOutput = value * MILE_TO_KM_EXACT;
    const formatted = formatPrecision(rawOutput, precision);
    const stepByStep = [
      `1. Base formula: Kilometers = Miles × ${MILE_TO_KM_EXACT}`,
      `2. Substitute input: ${value} mi × ${MILE_TO_KM_EXACT}`,
      `3. Exact product: ${rawOutput.toFixed(10)} km`,
      `4. Rounded to ${precision === -1 ? 'exact' : precision + ' decimal places'}: ${formatted} km`,
    ];

    return {
      inputValue: value,
      inputUnit: 'mi',
      outputValue: rawOutput,
      outputUnit: 'km',
      formattedResult: formatted,
      formula: `${value} mi × 1.609344 = ${formatted} km`,
      stepByStep,
      scientificNotation: rawOutput.toExponential(4),
      approximateFraction: getApproximateRatio(value, rawOutput),
    };
  }
}

function getApproximateRatio(input: number, output: number): string {
  if (input === 0 || !isFinite(input) || !isFinite(output)) return '0 / 0';
  const ratio = output / input;
  if (!isFinite(ratio) || isNaN(ratio)) return '1 : 1';
  // Fibonacci approximation: 5 km ≈ 3.1 mi, 8 km ≈ 5 mi
  if (Math.abs(ratio - KM_TO_MILE_FACTOR) < 0.001) {
    return `Ratio: ≈ 5 : 3.107 (5 km ≈ 3.1 miles)`;
  }
  return `Ratio: 1 : ${ratio.toFixed(4)}`;
}

export const COMMON_PRESETS: ConversionPreset[] = [
  {
    label: '5K Run',
    description: 'Standard road race distance',
    value: 5,
    direction: 'km_to_mi',
    category: 'running',
  },
  {
    label: '10K Run',
    description: 'Popular intermediate race',
    value: 10,
    direction: 'km_to_mi',
    category: 'running',
  },
  {
    label: 'Half Marathon',
    description: '21.0975 kilometers',
    value: 21.0975,
    direction: 'km_to_mi',
    category: 'running',
  },
  {
    label: 'Marathon',
    description: '42.195 kilometers',
    value: 42.195,
    direction: 'km_to_mi',
    category: 'running',
  },
  {
    label: '1 Mile',
    description: 'Standard track mile',
    value: 1,
    direction: 'mi_to_km',
    category: 'everyday',
  },
  {
    label: '10 Miles',
    description: 'Common distance marker',
    value: 10,
    direction: 'mi_to_km',
    category: 'everyday',
  },
  {
    label: '50 Miles',
    description: 'Ultra-marathon milestone',
    value: 50,
    direction: 'mi_to_km',
    category: 'running',
  },
  {
    label: '60 MPH / 60 Mi',
    description: 'Highway travel segment',
    value: 60,
    direction: 'mi_to_km',
    category: 'driving',
  },
  {
    label: '100 km/h / 100 km',
    description: 'Standard international highway speed/distance',
    value: 100,
    direction: 'km_to_mi',
    category: 'driving',
  },
];

export function generateCSVContent(records: ConversionRecord[]): string {
  const headers = [
    'Input Value',
    'Input Unit',
    'Output Value',
    'Output Unit',
    'Timestamp',
    'Date & Time (UTC)',
    'Conversion Formula',
    'Precision Decimals',
    'Record ID',
    'User ID',
    'Note',
  ];

  const escapeCSV = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const rows = records.map((rec) => {
    const isoDate = new Date(rec.timestamp).toISOString();
    return [
      escapeCSV(rec.inputValue),
      escapeCSV(rec.inputUnit),
      escapeCSV(rec.outputValue),
      escapeCSV(rec.outputUnit),
      escapeCSV(rec.timestamp),
      escapeCSV(isoDate),
      escapeCSV(rec.formula),
      escapeCSV(rec.precision),
      escapeCSV(rec.id),
      escapeCSV(rec.userId),
      escapeCSV(rec.note || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

export function downloadCSV(records: ConversionRecord[], filename?: string): boolean {
  if (!records || records.length === 0) {
    return false;
  }

  const csv = generateCSVContent(records);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const finalName = filename || `conversion_history_${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
