'use client';

import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  BookmarkPlus,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  Car,
  Compass,
  Bell,
  BellRing,
  Trophy,
  Zap,
  Globe,
} from 'lucide-react';
import { ConversionDirection, ConversionPreset } from '@/types/converter';
import {
  convertDistance,
  validateNumericInput,
  COMMON_PRESETS,
  ConversionResult,
  KM_TO_MILE_FACTOR,
  MILE_TO_KM_EXACT,
} from '@/lib/converter';
import {
  evaluateConversionAlert,
  SIGNIFICANT_MILESTONES,
  DISTANCE_SCALE_THRESHOLDS,
  ThresholdEvaluationResult,
} from '@/lib/thresholds';
import { DistanceScaleVisualizer } from './DistanceScaleVisualizer';
import { useHistory } from '@/context/HistoryContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './Toast';

const PRECISION_OPTIONS = [
  { label: '2 Decimals', value: 2 },
  { label: '3 Decimals', value: 3 },
  { label: '4 Decimals (Std)', value: 4 },
  { label: '6 Decimals (High)', value: 6 },
  { label: 'Exact', value: -1 },
];

const THRESHOLD_PRESET_BUTTONS = [50, 100, 250, 500, 1000];

export function ConverterCard() {
  const { currentUser } = useAuth();
  const { addRecord } = useHistory();
  const { showToast } = useToast();

  const [direction, setDirection] = useState<ConversionDirection>(
    currentUser?.defaultDirection || 'km_to_mi'
  );
  const [inputValue, setInputValue] = useState<string>('10');
  const [precision, setPrecision] = useState<number>(
    currentUser?.defaultPrecision !== undefined ? currentUser.defaultPrecision : 4
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [showSteps, setShowSteps] = useState<boolean>(false);
  const [autoSaveToLog, setAutoSaveToLog] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Threshold alert notification configuration
  const [enableThresholdAlerts, setEnableThresholdAlerts] = useState<boolean>(true);
  const [customThresholdEnabled, setCustomThresholdEnabled] = useState<boolean>(false);
  const [customThresholdValue, setCustomThresholdValue] = useState<number>(100);
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const lastAlertKeyRef = useRef<string | null>(null);

  // Validation
  const validation = validateNumericInput(inputValue);
  const isInputValid = validation.isValid && validation.numericValue !== undefined;
  const numValue = validation.numericValue ?? 0;

  // Calculation result (memoized to keep reference stable)
  const result: ConversionResult | null = React.useMemo(
    () => (isInputValid ? convertDistance(numValue, direction, precision) : null),
    [isInputValid, numValue, direction, precision]
  );

  // Current milestone/threshold evaluation preview
  const currentAlertPreview: ThresholdEvaluationResult = React.useMemo(() => {
    if (!isInputValid || numValue <= 0) {
      return { hasAlert: false, alertType: null, payload: null, triggerKey: null };
    }
    return evaluateConversionAlert(
      numValue,
      direction,
      precision,
      { enabled: customThresholdEnabled, value: customThresholdValue }
    );
  }, [numValue, direction, precision, isInputValid, customThresholdEnabled, customThresholdValue]);

  // Real-time debounced evaluation for toast notifications on significant conversions
  useEffect(() => {
    if (!hasInteracted || !isInputValid || !enableThresholdAlerts || numValue <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      const alertCheck = evaluateConversionAlert(
        numValue,
        direction,
        precision,
        { enabled: customThresholdEnabled, value: customThresholdValue }
      );

      if (alertCheck.hasAlert && alertCheck.payload && alertCheck.triggerKey) {
        // Prevent spamming the exact same notification repeatedly
        if (lastAlertKeyRef.current !== alertCheck.triggerKey) {
          lastAlertKeyRef.current = alertCheck.triggerKey;
          showToast(alertCheck.payload);
        }
      } else {
        lastAlertKeyRef.current = null;
      }
    }, 850);

    return () => clearTimeout(timer);
  }, [
    numValue,
    direction,
    precision,
    hasInteracted,
    isInputValid,
    enableThresholdAlerts,
    customThresholdEnabled,
    customThresholdValue,
    showToast,
  ]);

  // Auto-save debounced calculation to history only after user actively interacts
  useEffect(() => {
    if (!hasInteracted || !result || !autoSaveToLog) return;

    const timer = setTimeout(() => {
      addRecord({
        inputValue: result.inputValue,
        inputUnit: result.inputUnit,
        outputValue: result.outputValue,
        outputUnit: result.outputUnit,
        precision,
        formula: result.formula,
        note: selectedPreset ? `Preset: ${selectedPreset}` : undefined,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [result, autoSaveToLog, precision, hasInteracted, addRecord, selectedPreset]);

  // Swap direction handler
  const handleSwap = () => {
    setHasInteracted(true);
    const nextDirection: ConversionDirection =
      direction === 'km_to_mi' ? 'mi_to_km' : 'km_to_mi';
    setDirection(nextDirection);

    // If we had a valid result, carry the output value to input for seamless reverse conversion
    if (result && isInputValid && numValue !== 0) {
      // Rounded clean string representation
      const nextInput = parseFloat(result.outputValue.toFixed(4)).toString();
      setInputValue(nextInput);
    }
    setSelectedPreset(null);
    showToast(`Swapped to ${nextDirection === 'km_to_mi' ? 'Kilometers → Miles' : 'Miles → Kilometers'}`, 'info');
  };

  // Preset selector
  const handleSelectPreset = (preset: ConversionPreset) => {
    setHasInteracted(true);
    setDirection(preset.direction);
    setInputValue(preset.value.toString());
    setSelectedPreset(preset.label);
    showToast(`Loaded preset: ${preset.label}`, 'info');
  };

  // Copy result
  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.formattedResult} ${result.outputUnit}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast(`Copied ${textToCopy} to clipboard!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Manual save to log
  const handleManualSave = () => {
    if (!result) return;
    addRecord({
      inputValue: result.inputValue,
      inputUnit: result.inputUnit,
      outputValue: result.outputValue,
      outputUnit: result.outputUnit,
      precision,
      formula: result.formula,
      note: selectedPreset ? `Preset: ${selectedPreset}` : 'Manual conversion record',
    });
    showToast('Saved conversion to personal history log!', 'success');
  };

  // Quick adjust adjustments
  const adjustValue = (delta: number) => {
    setHasInteracted(true);
    const current = isInputValid ? numValue : 0;
    const next = Math.max(0, parseFloat((current + delta).toFixed(4)));
    setInputValue(next.toString());
    setSelectedPreset(null);
  };

  const multiplyValue = (factor: number) => {
    setHasInteracted(true);
    const current = isInputValid ? numValue : 0;
    const next = Math.max(0, parseFloat((current * factor).toFixed(4)));
    setInputValue(next.toString());
    setSelectedPreset(null);
  };

  const handleReset = () => {
    setHasInteracted(true);
    setInputValue('');
    setSelectedPreset(null);
  };

  const handleScaleValueChange = useCallback((val: number) => {
    setHasInteracted(true);
    setInputValue(val.toString());
    setSelectedPreset(null);
  }, []);

  // Trigger test milestone toast
  const handleTestMilestoneToast = (milestoneKey: '5k' | 'marathon' | '1000km' | 'custom') => {
    setHasInteracted(true);
    if (milestoneKey === '5k') {
      setInputValue('5');
      setDirection('km_to_mi');
      showToast({
        title: '🏃 5K Parkrun Milestone Reached',
        message: 'Evaluated official 5,000m road race distance (5.0 km ≈ 3.11 mi)!',
        type: 'milestone',
        badge: '5K Milestone',
        iconType: 'trophy',
        duration: 4800,
      });
    } else if (milestoneKey === 'marathon') {
      setInputValue('42.195');
      setDirection('km_to_mi');
      showToast({
        title: '🏆 Official Marathon Distance Reached',
        message: 'Full Olympic 42.195 km / 26.22 mi marathon standard evaluated!',
        type: 'milestone',
        badge: 'Marathon 42.2K',
        iconType: 'trophy',
        duration: 5000,
      });
    } else if (milestoneKey === '1000km') {
      setInputValue('1000');
      setDirection('km_to_mi');
      showToast({
        title: '🌐 Transcontinental Distance (>1,000 km)',
        message: 'Significant continental transit: 1,000 km equals 621.37 mi!',
        type: 'threshold',
        badge: 'Continental Threshold',
        iconType: 'compass',
        duration: 4800,
      });
    } else if (milestoneKey === 'custom') {
      const val = customThresholdValue || 100;
      setInputValue(val.toString());
      showToast({
        title: `🚨 Custom Threshold Exceeded (≥ ${val} ${direction === 'km_to_mi' ? 'km' : 'mi'})`,
        message: `Conversion result matches or exceeds your configured alert threshold of ${val}!`,
        type: 'threshold',
        badge: `Alert: ${val}`,
        iconType: 'zap',
        duration: 4500,
      });
    }
  };

  return (
    <section
      id="converter-main-section"
      className="w-full max-w-4xl mx-auto"
      aria-label="Unit Converter Core Interface"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 transition-all">
        {/* Title Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Distance Converter
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            High-precision distance calculation between kilometers and statute miles
          </p>
        </div>

        {/* Direction Switcher & Precision Toolbar */}
        <div
          id="direction-selector-tabs"
          className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-2.5"
        >
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto">
            <button
              id="tab-km-to-mi"
              onClick={() => {
                setHasInteracted(true);
                setDirection('km_to_mi');
                setSelectedPreset(null);
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                direction === 'km_to_mi'
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-selected={direction === 'km_to_mi'}
              role="tab"
            >
              <span>Kilometers</span>
              <span className="text-slate-400">→</span>
              <span>Miles</span>
            </button>
            <button
              id="tab-mi-to-km"
              onClick={() => {
                setHasInteracted(true);
                setDirection('mi_to_km');
                setSelectedPreset(null);
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                direction === 'mi_to_km'
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-selected={direction === 'mi_to_km'}
              role="tab"
            >
              <span>Miles</span>
              <span className="text-slate-400">→</span>
              <span>Kilometers</span>
            </button>
          </div>

          {/* Precision Selector & Threshold Alert Config Button */}
          <div className="flex items-center justify-end w-full sm:w-auto gap-2 px-1">
            <button
              id="btn-toggle-threshold-config"
              onClick={() => setShowThresholdConfig(!showThresholdConfig)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showThresholdConfig || (customThresholdEnabled && enableThresholdAlerts)
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
              title="Configure threshold alert notifications"
              aria-expanded={showThresholdConfig}
            >
              {enableThresholdAlerts ? (
                <BellRing className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Alerts</span>
              {customThresholdEnabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              )}
            </button>

            <label
              htmlFor="select-precision"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline"
            >
              Precision:
            </label>
            <select
              id="select-precision"
              value={precision}
              onChange={(e) => {
                setHasInteracted(true);
                setPrecision(Number(e.target.value));
              }}
              className="text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Select decimal precision"
            >
              {PRECISION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Threshold Alerts & Milestones Configuration Drawer */}
        <AnimatePresence>
          {showThresholdConfig && (
            <motion.div
              id="threshold-alerts-config-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                      <BellRing className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Threshold & Significant Milestone Alert System</span>
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Automatically sends toast alerts when conversions reach official race benchmarks or cross distance limits
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
                    <input
                      id="toggle-master-threshold-alerts"
                      type="checkbox"
                      checked={enableThresholdAlerts}
                      onChange={(e) => {
                        setEnableThresholdAlerts(e.target.checked);
                        showToast(
                          e.target.checked
                            ? 'Milestone & threshold alert toasts enabled!'
                            : 'Threshold alerts muted.',
                          e.target.checked ? 'success' : 'info'
                        );
                      }}
                      className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 dark:border-indigo-700 dark:bg-slate-800 w-4 h-4"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {enableThresholdAlerts ? 'Alerts Active' : 'Alerts Paused'}
                    </span>
                  </label>
                </div>

                {/* Custom Threshold Limit Setter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="toggle-custom-threshold"
                        className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Custom Distance Threshold Alert</span>
                      </label>
                      <input
                        id="toggle-custom-threshold"
                        type="checkbox"
                        checked={customThresholdEnabled}
                        onChange={(e) => setCustomThresholdEnabled(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Alert me with a toast when distance reaches or exceeds:
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        id="custom-threshold-number-input"
                        type="number"
                        min="1"
                        step="1"
                        disabled={!customThresholdEnabled}
                        value={customThresholdValue}
                        onChange={(e) => setCustomThresholdValue(Math.max(1, Number(e.target.value)))}
                        className="w-24 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white text-xs disabled:opacity-50"
                      />
                      <span className="font-bold text-slate-600 dark:text-slate-400">
                        {direction === 'km_to_mi' ? 'Kilometers' : 'Miles'}
                      </span>
                    </div>

                    {/* Threshold quick presets */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                      {THRESHOLD_PRESET_BUTTONS.map((val) => (
                        <button
                          key={val}
                          id={`btn-thresh-preset-${val}`}
                          disabled={!customThresholdEnabled}
                          onClick={() => setCustomThresholdValue(val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all disabled:opacity-40 ${
                            customThresholdValue === val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Test Alerts Sandbox */}
                  <div className="space-y-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Test & Preview Notification Toasts</span>
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Click any benchmark below to test instant toast rendering:
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        id="btn-test-5k-toast"
                        onClick={() => handleTestMilestoneToast('5k')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-left font-bold text-[11px] transition-all flex items-center gap-1.5"
                      >
                        <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">5K Parkrun</span>
                      </button>

                      <button
                        id="btn-test-marathon-toast"
                        onClick={() => handleTestMilestoneToast('marathon')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-left font-bold text-[11px] transition-all flex items-center gap-1.5"
                      >
                        <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">42.2K Marathon</span>
                      </button>

                      <button
                        id="btn-test-scale-toast"
                        onClick={() => handleTestMilestoneToast('1000km')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-left font-bold text-[11px] transition-all flex items-center gap-1.5"
                      >
                        <Compass className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">1,000 km Scale</span>
                      </button>

                      <button
                        id="btn-test-custom-toast"
                        onClick={() => handleTestMilestoneToast('custom')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-left font-bold text-[11px] transition-all flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">Custom Threshold</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input & Output Stack */}
        <div className="space-y-4">
          {/* Input Value Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="distance-number-input"
                className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
              >
                Input Value ({direction === 'km_to_mi' ? 'Kilometers' : 'Miles'})
              </label>
              {isInputValid && numValue < 0 && (
                <span
                  id="negative-value-notice"
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-medium"
                >
                  Negative displacement / vector
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="distance-number-input"
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => {
                  setHasInteracted(true);
                  setInputValue(e.target.value);
                  setSelectedPreset(null);
                }}
                placeholder="e.g. 10.5 or 42.195"
                className={`w-full px-4 py-4 pr-16 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xl sm:text-2xl font-mono font-medium focus:outline-none focus:ring-2 transition-all ${
                  validation.isValid
                    ? 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-slate-100'
                    : 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 bg-rose-50/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                }`}
                aria-invalid={!validation.isValid}
                aria-describedby={!validation.isValid ? 'input-error-msg' : undefined}
                autoComplete="off"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {inputValue && (
                  <button
                    id="btn-clear-input"
                    onClick={handleReset}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Clear input"
                    aria-label="Clear distance input"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {direction === 'km_to_mi' ? 'KM' : 'MI'}
                </span>
              </div>
            </div>

            {/* Inline Error Message */}
            {!validation.isValid && (
              <motion.div
                id="input-error-msg"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400"
                role="alert"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.error}</span>
              </motion.div>
            )}

            {/* Quick Adjust Arithmetic Steppers */}
            <div
              id="quick-steppers-bar"
              className="pt-2 flex flex-wrap items-center gap-1.5"
            >
              <button
                id="btn-step-plus-1"
                onClick={() => adjustValue(1)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Add 1"
              >
                +1
              </button>
              <button
                id="btn-step-minus-1"
                onClick={() => adjustValue(-1)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Subtract 1"
              >
                -1
              </button>
              <button
                id="btn-step-plus-5"
                onClick={() => adjustValue(5)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Add 5"
              >
                +5
              </button>
              <button
                id="btn-step-plus-10"
                onClick={() => adjustValue(10)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Add 10"
              >
                +10
              </button>
              <button
                id="btn-step-double"
                onClick={() => multiplyValue(2)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Double input value"
              >
                ×2
              </button>
              <button
                id="btn-step-half"
                onClick={() => multiplyValue(0.5)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Halve input value"
              >
                ÷2
              </button>
            </div>
          </div>

          {/* Central Divider with Swap Button */}
          <div className="flex items-center justify-between py-1">
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
            <button
              id="btn-swap-direction"
              onClick={handleSwap}
              className="mx-4 p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all transform hover:rotate-180 shadow-xs active:scale-95"
              title="Swap conversion direction (Shortcut: S)"
              aria-label="Swap conversion units"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 flex-grow"></div>
          </div>

          {/* Live Significant Milestone / Threshold Indicator Banner */}
          <AnimatePresence>
            {currentAlertPreview?.hasAlert && currentAlertPreview.payload && (
              <motion.div
                id="live-milestone-detected-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                  currentAlertPreview.alertType === 'milestone'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-100'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-100'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      currentAlertPreview.alertType === 'milestone'
                        ? 'bg-amber-200/70 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                        : 'bg-indigo-200/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200'
                    }`}
                  >
                    {currentAlertPreview.alertType === 'milestone' ? (
                      <Trophy className="w-3.5 h-3.5" />
                    ) : (
                      <Compass className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-extrabold mr-1.5">
                      {currentAlertPreview.payload.title}
                    </span>
                    <span className="text-[11px] opacity-85 hidden sm:inline">
                      {currentAlertPreview.payload.message}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-retrigger-alert-toast"
                  onClick={() => {
                    if (currentAlertPreview.payload) {
                      showToast(currentAlertPreview.payload);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-current/20 shadow-2xs whitespace-nowrap shrink-0 transition-all"
                >
                  Show Alert Toast
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversion Result Hero Box */}
          <div className="space-y-2" id="output-result-card" role="region" aria-live="polite" aria-label="Converted Output Result">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Conversion Result
              </label>
              {result && (
                <button
                  id="btn-copy-result"
                  onClick={handleCopy}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-indigo-600'
                  }`}
                  title="Copy result"
                  aria-label="Copy result"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="w-full px-4 py-6 bg-indigo-600 rounded-xl text-center shadow-lg shadow-indigo-100 dark:shadow-none transition-all">
              {result ? (
                <motion.div
                  key={result.formattedResult}
                  initial={{ scale: 0.98, opacity: 0.85 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-wrap items-baseline justify-center"
                >
                  <span
                    id="formatted-conversion-value"
                    className="text-white text-3xl sm:text-4xl font-black tabular-nums tracking-tight font-mono"
                  >
                    {result.formattedResult}
                  </span>
                  <span
                    id="output-unit-pill"
                    className="text-indigo-200 text-lg ml-2 font-semibold uppercase tracking-wide"
                  >
                    {direction === 'km_to_mi' ? 'Miles' : 'Kilometers'}
                  </span>
                </motion.div>
              ) : (
                <span className="text-indigo-200 text-3xl font-mono font-bold">---</span>
              )}
            </div>

            {/* Formula and Details Row */}
            {result && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <div id="conversion-formula-readout" className="font-mono text-[11px] sm:text-xs">
                  {result.formula}
                </div>
                <span
                  id="approximate-ratio-badge"
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                >
                  {result.approximateFraction}
                </span>
              </div>
            )}
          </div>

          {/* Graphical Distance Scale & Interactive Slider */}
          <DistanceScaleVisualizer
            value={numValue}
            direction={direction}
            onValueChange={handleScaleValueChange}
            precision={precision}
            isValid={isInputValid}
          />
        </div>

        {/* Popular Race & Speed Benchmarks */}
        <div id="presets-container" className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-indigo-500" />
              Quick Distance Presets
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Click to load
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {COMMON_PRESETS.map((preset) => {
              const isActive =
                selectedPreset === preset.label ||
                (inputValue === preset.value.toString() && direction === preset.direction);

              return (
                <button
                  key={preset.label}
                  id={`preset-btn-${preset.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-2 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{preset.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        isActive
                          ? 'bg-indigo-700 text-indigo-100'
                          : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {preset.direction === 'km_to_mi' ? 'km' : 'mi'}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {preset.value} {preset.direction === 'km_to_mi' ? 'km' : 'mi'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Row & Step-by-Step Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="btn-toggle-steps"
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              aria-expanded={showSteps}
              aria-controls="step-by-step-panel"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showSteps ? 'Hide Calculation Steps' : 'Show Calculation Steps'}</span>
              {showSteps ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <label
              id="label-auto-save"
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none"
            >
              <input
                id="checkbox-auto-save"
                type="checkbox"
                checked={autoSaveToLog}
                onChange={(e) => setAutoSaveToLog(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 w-3.5 h-3.5"
              />
              <span>Auto-log conversions</span>
            </label>
          </div>

          {/* Manual Save Button */}
          {result && (
            <button
              id="btn-manual-save-log"
              onClick={handleManualSave}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              aria-label="Save this conversion to personal log"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Save to History</span>
            </button>
          )}
        </div>

        {/* Step-by-Step Derivation Breakdown */}
        <AnimatePresence>
          {showSteps && result && (
            <motion.div
              id="step-by-step-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2.5 font-mono">
                <div className="font-sans font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Derivation & Calculation Steps</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    Standard: 1959 Agreement
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                  {result.stepByStep.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs"
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  <strong>Scientific representation:</strong>{' '}
                  <span className="font-mono">{result.scientificNotation}</span>{' '}
                  {result.outputUnit}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
