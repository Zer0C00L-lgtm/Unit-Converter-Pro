'use client';

import React, { useState } from 'react';
import { Table, Compass, ArrowLeftRight } from 'lucide-react';
import { KM_TO_MILE_FACTOR, MILE_TO_KM_EXACT } from '@/lib/converter';

const REFERENCE_VALUES = [
  1, 2, 3, 5, 8, 10, 15, 20, 21.0975, 25, 30, 42.195, 50, 60, 80, 100,
];

export function QuickReferenceTable() {
  const [activeTab, setActiveTab] = useState<'km_to_mi' | 'mi_to_km'>('km_to_mi');

  return (
    <section
      id="quick-reference-section"
      className="w-full max-w-4xl mx-auto mt-8 space-y-4"
      aria-label="Quick Distance Conversion Reference Matrix"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3
              id="reference-matrix-heading"
              className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
            >
              <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Quick Reference Conversion Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Standard lookup values for athletes, travelers, and engineers
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              id="btn-matrix-km-to-mi"
              onClick={() => setActiveTab('km_to_mi')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === 'km_to_mi'
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              km → mi
            </button>
            <button
              id="btn-matrix-mi-to-km"
              onClick={() => setActiveTab('mi_to_km')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === 'mi_to_km'
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              mi → km
            </button>
          </div>
        </div>

        {/* Matrix Grid */}
        <div
          id="reference-matrix-grid"
          className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2"
        >
          {REFERENCE_VALUES.map((val) => {
            const converted =
              activeTab === 'km_to_mi'
                ? (val * KM_TO_MILE_FACTOR).toFixed(val % 1 !== 0 ? 2 : 3)
                : (val * MILE_TO_KM_EXACT).toFixed(val % 1 !== 0 ? 2 : 3);

            const inputUnit = activeTab === 'km_to_mi' ? 'km' : 'mi';
            const outputUnit = activeTab === 'km_to_mi' ? 'mi' : 'km';

            return (
              <div
                key={val}
                id={`matrix-item-${val}`}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
              >
                <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {val} <span className="text-[10px] text-slate-400 font-sans">{inputUnit}</span>
                </div>
                <div className="text-[10px] text-indigo-500 font-bold my-0.5">→</div>
                <div className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {converted}{' '}
                  <span className="text-[10px] text-indigo-400 font-sans">{outputUnit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
