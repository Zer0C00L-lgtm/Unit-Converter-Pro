'use client';

import React, { useState, useMemo, useId } from 'react';
import { motion } from 'motion/react';
import {
  Ruler,
  Sliders,
  MapPin,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ConversionDirection } from '@/types/converter';
import { KM_TO_MILE_FACTOR, MILE_TO_KM_EXACT, formatPrecision } from '@/lib/converter';

interface DistanceScaleVisualizerProps {
  value: number;
  direction: ConversionDirection;
  onValueChange: (val: number) => void;
  precision: number;
  isValid: boolean;
}

interface ScaleMilestone {
  label: string;
  km: number;
  mi: number;
  tag: string;
}

const SCALE_MILESTONES: ScaleMilestone[] = [
  { label: '5K Run', km: 5, mi: 3.10686, tag: '5K' },
  { label: '10K Race', km: 10, mi: 6.21371, tag: '10K' },
  { label: 'Half Marathon', km: 21.0975, mi: 13.1094, tag: '21.1K' },
  { label: 'Marathon', km: 42.195, mi: 26.21875, tag: '42.2K' },
  { label: '100K Ultra', km: 100, mi: 62.1371, tag: '100K' },
  { label: 'Century Ride', km: 160.9344, mi: 100, tag: '100 Mi' },
];

const PRESET_RANGES = [25, 50, 100, 250, 500];

export function DistanceScaleVisualizer({
  value,
  direction,
  onValueChange,
  precision,
  isValid,
}: DistanceScaleVisualizerProps) {
  const componentId = useId();
  const [userSelectedMax, setUserSelectedMax] = useState<number | 'auto'>('auto');
  const [showProportions, setShowProportions] = useState<boolean>(true);

  const safeVal = isValid && isFinite(value) && value >= 0 ? value : 0;
  const isKm = direction === 'km_to_mi';
  const primaryUnit = isKm ? 'km' : 'mi';
  const secondaryUnit = isKm ? 'mi' : 'km';

  // Calculate corresponding converted value
  const convertedVal = isKm ? safeVal * KM_TO_MILE_FACTOR : safeVal * MILE_TO_KM_EXACT;

  // Determine current scale maximum
  const currentMax = useMemo(() => {
    if (userSelectedMax !== 'auto') {
      // If user typed a value higher than selected max, expand dynamically
      return Math.max(userSelectedMax, safeVal > 0 ? Math.ceil(safeVal * 1.1) : userSelectedMax);
    }
    // Auto scale range based on current value
    if (safeVal <= 20) return 25;
    if (safeVal <= 45) return 50;
    if (safeVal <= 90) return 100;
    if (safeVal <= 220) return 250;
    if (safeVal <= 450) return 500;
    if (safeVal <= 900) return 1000;
    return Math.ceil((safeVal * 1.25) / 100) * 100;
  }, [userSelectedMax, safeVal]);

  // Secondary scale maximum (physically aligned with primary max)
  const secondaryMax = isKm
    ? currentMax * KM_TO_MILE_FACTOR
    : currentMax * MILE_TO_KM_EXACT;

  // Clamped percentage for current value on primary scale (0% to 100%)
  const percentage = currentMax > 0 ? Math.min(100, Math.max(0, (safeVal / currentMax) * 100)) : 0;

  // Ticks calculation for primary ruler (5 major steps)
  const primaryTicks = useMemo(() => {
    const steps = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= steps; i++) {
      ticks.push(Math.round((currentMax / steps) * i * 10) / 10);
    }
    return ticks;
  }, [currentMax]);

  // Secondary ticks physically aligned with primary
  const secondaryTicks = useMemo(() => {
    const steps = 5;
    const ticks: number[] = [];
    for (let i = 0; i <= steps; i++) {
      ticks.push(Math.round((secondaryMax / steps) * i * 10) / 10);
    }
    return ticks;
  }, [secondaryMax]);

  // Filter milestones that fit within current scale
  const visibleMilestones = useMemo(() => {
    return SCALE_MILESTONES.filter((m) => {
      const targetVal = isKm ? m.km : m.mi;
      return targetVal <= currentMax * 1.02;
    });
  }, [isKm, currentMax]);

  // Handle slider drag / change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    const steppedVal = rawVal < 10 ? Math.round(rawVal * 10) / 10 : Math.round(rawVal);
    onValueChange(steppedVal);
  };

  // Step slider dynamically: finer resolution for smaller numbers
  const sliderStep = currentMax <= 50 ? '0.1' : currentMax <= 200 ? '0.5' : '1';

  return (
    <div
      id="distance-scale-visualizer-container"
      className="p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 space-y-5 transition-all"
      aria-label="Interactive Distance Scale & Visual Ruler"
    >
      {/* Header with Scale Controls & Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Interactive Dual-Scale Ruler</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                1:{isKm ? '0.621' : '1.609'} Ratio
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Drag slider or type value to visually align physical distance
            </p>
          </div>
        </div>

        {/* Range Bounds Selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1.5 uppercase">
            Range:
          </span>
          <button
            id="btn-scale-range-auto"
            onClick={() => setUserSelectedMax('auto')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
              userSelectedMax === 'auto'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Auto-adjust range to input"
          >
            Auto
          </button>
          {PRESET_RANGES.map((rng) => (
            <button
              key={rng}
              id={`btn-scale-range-${rng}`}
              onClick={() => setUserSelectedMax(rng)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                userSelectedMax === rng
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Dual Scale Stage */}
      <div className="space-y-2 relative pt-2">
        {/* Top Ruler: Primary Input Unit (KM or MI) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>{isKm ? 'Kilometers Scale (KM)' : 'Miles Scale (MI)'}</span>
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              0 → {currentMax} {primaryUnit}
            </span>
          </div>

          {/* Primary Ruler Axis */}
          <div
            id="primary-ruler-track"
            className="relative h-7 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex items-end px-3 select-none"
          >
            {/* Primary Filled Bar */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-indigo-500/15 dark:bg-indigo-500/25 border-r-2 border-indigo-600"
              style={{ width: `${percentage}%` }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            />

            {/* Tick Marks on Primary Scale */}
            <div className="w-full flex justify-between relative z-10 text-[10px] font-mono text-slate-400 dark:text-slate-500 pb-1">
              {primaryTicks.map((tick, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-2 w-px bg-slate-300 dark:bg-slate-700"></div>
                  <span className="mt-0.5">{tick}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Dual-Pointer Bridge & Range Slider */}
        <div className="relative py-2 px-1">
          {/* Interactive Range Input Slider */}
          <input
            id="interactive-distance-slider"
            type="range"
            min="0"
            max={currentMax}
            step={sliderStep}
            value={safeVal}
            onChange={handleSliderChange}
            aria-label={`Adjust distance in ${primaryUnit}`}
            aria-valuenow={safeVal}
            aria-valuemin={0}
            aria-valuemax={currentMax}
            className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all relative z-20"
          />

          {/* Floating Indicator Tooltip Badge */}
          <div
            className="absolute -top-7 -translate-x-1/2 pointer-events-none transition-all duration-75 z-30 hidden sm:flex flex-col items-center"
            style={{ left: `${percentage}%` }}
          >
            <div className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-[11px] font-mono font-bold shadow-md whitespace-nowrap">
              {safeVal} {primaryUnit} ≈ {formatPrecision(convertedVal, precision === -1 ? 3 : precision)} {secondaryUnit}
            </div>
            <div className="w-1.5 h-1.5 bg-slate-900 dark:bg-white rotate-45 -mt-0.5"></div>
          </div>
        </div>

        {/* Bottom Ruler: Secondary Output Unit (MI or KM physically matched) */}
        <div className="space-y-1">
          <div
            id="secondary-ruler-track"
            className="relative h-7 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex items-end px-3 select-none"
          >
            {/* Secondary Filled Bar */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 dark:bg-emerald-500/25 border-r-2 border-emerald-600"
              style={{ width: `${percentage}%` }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            />

            {/* Tick Marks on Secondary Scale */}
            <div className="w-full flex justify-between relative z-10 text-[10px] font-mono text-slate-400 dark:text-slate-500 pb-1">
              {secondaryTicks.map((tick, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-2 w-px bg-slate-300 dark:bg-slate-700"></div>
                  <span className="mt-0.5">{tick}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{isKm ? 'Miles Scale (MI)' : 'Kilometers Scale (KM)'}</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              0 → {secondaryMax.toFixed(1)} {secondaryUnit}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Proportional Length Gauge */}
      {showProportions && (
        <div
          id="proportional-comparison-card"
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Physical Distance Ratio Comparison</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              1 Mile = 1.609344 KM
            </span>
          </div>

          {/* Side-by-side Unit Proportion Comparison */}
          <div className="space-y-1.5 pt-1 font-mono text-[11px]">
            {/* 1 KM Bar Representation */}
            <div className="flex items-center gap-2">
              <span className="w-14 text-right font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                1.00 km
              </span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(1 / MILE_TO_KM_EXACT) * 100}%` }}
                ></div>
              </div>
              <span className="w-16 text-slate-500 dark:text-slate-400 text-[10px] shrink-0">
                62.1% of mile
              </span>
            </div>

            {/* 1 Mile Bar Representation */}
            <div className="flex items-center gap-2">
              <span className="w-14 text-right font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                1.00 mi
              </span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full w-full"></div>
              </div>
              <span className="w-16 text-slate-500 dark:text-slate-400 text-[10px] shrink-0">
                100% (1.61 km)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Landmark Milestone Pins along the scale */}
      {visibleMilestones.length > 0 && (
        <div id="scale-milestone-chips" className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-indigo-500" />
              <span>Scale Benchmarks</span>
            </span>
            <span className="text-[10px] lowercase font-normal">click to jump slider</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {visibleMilestones.map((m) => {
              const target = isKm ? m.km : m.mi;
              const isTargetActive = Math.abs(safeVal - target) < 0.05;

              return (
                <button
                  key={m.label}
                  id={`milestone-btn-${m.tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => onValueChange(target)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    isTargetActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600'
                  }`}
                >
                  <span className="font-bold">{m.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded ${
                      isTargetActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isKm ? `${m.km}k` : `${m.mi.toFixed(1)}m`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
