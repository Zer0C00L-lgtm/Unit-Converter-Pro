'use client';

import React from 'react';
import {
  Download,
  Trash2,
  Search,
  History,
  Filter,
  ArrowRight,
  TrendingUp,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useHistory } from '@/context/HistoryContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './Toast';
import { ConversionDirection } from '@/types/converter';
import { formatPrecision } from '@/lib/converter';

export function HistorySection() {
  const { currentUser } = useAuth();
  const {
    records,
    filteredRecords,
    searchQuery,
    setSearchQuery,
    directionFilter,
    setDirectionFilter,
    deleteRecord,
    clearHistory,
    exportCSV,
    stats,
  } = useHistory();
  const { showToast } = useToast();

  const handleExportCSV = () => {
    if (records.length === 0) {
      showToast('No conversion records available to export.', 'error');
      return;
    }
    const success = exportCSV(filteredRecords.length > 0 && searchQuery ? filteredRecords : records);
    if (success) {
      showToast(`Exported ${records.length} conversion records as CSV!`, 'success');
    } else {
      showToast('Failed to export CSV file.', 'error');
    }
  };

  const handleClearAll = () => {
    if (records.length === 0) return;
    if (window.confirm('Are you sure you want to clear your conversion history?')) {
      clearHistory();
      showToast('Conversion history cleared.', 'info');
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section
      id="history-export-section"
      className="w-full max-w-4xl mx-auto mt-8 space-y-6"
      aria-label="Conversion History and Data Export"
    >
      {/* Stats Header Grid */}
      <div id="stats-summary-grid" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          id="stat-card-total-conversions"
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Total Logs</span>
          </div>
          <div
            id="stat-value-total"
            className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1"
          >
            {stats.totalCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {currentUser.isGuest ? 'Guest Session' : currentUser.email}
          </div>
        </div>

        <div
          id="stat-card-km-to-mi"
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>km → mi</span>
          </div>
          <div
            id="stat-value-km-to-mi"
            className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1"
          >
            {stats.kmToMiCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Metric to Imperial</div>
        </div>

        <div
          id="stat-card-mi-to-km"
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>mi → km</span>
          </div>
          <div
            id="stat-value-mi-to-km"
            className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1"
          >
            {stats.miToKmCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Imperial to Metric</div>
        </div>

        <div
          id="stat-card-km-sum"
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Sum Distance</span>
          </div>
          <div
            id="stat-value-sum-km"
            className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 truncate"
          >
            {(stats.totalKmConverted || 0).toFixed(1)}{' '}
            <span className="text-xs font-semibold text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            ≈ {(stats.totalMiConverted || 0).toFixed(1)} mi total
          </div>
        </div>
      </div>

      {/* Main History Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="history-heading"
                className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Conversion History & Data Log
              </h2>
              <span
                id="history-count-badge"
                className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {filteredRecords.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal session records for {currentUser.name} ({currentUser.email})
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Export Data Button */}
            <button
              id="btn-export-data"
              data-testid="btn-export-data"
              onClick={handleExportCSV}
              disabled={records.length === 0}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm transition-all flex items-center justify-center gap-2"
              title="Download past conversions as CSV file"
              aria-label="Export Data"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Data</span>
            </button>

            {/* Clear All Button */}
            {records.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={handleClearAll}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors flex items-center gap-1.5"
                title="Clear all records for current user"
                aria-label="Clear all conversion records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          id="history-filters-bar"
          className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-history"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search distance values..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Search conversion history"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Direction Filter Pills */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            <button
              id="filter-direction-all"
              onClick={() => setDirectionFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                directionFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              All Types
            </button>
            <button
              id="filter-direction-km-to-mi"
              onClick={() => setDirectionFilter('km_to_mi')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                directionFilter === 'km_to_mi'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              km → mi
            </button>
            <button
              id="filter-direction-mi-to-km"
              onClick={() => setDirectionFilter('mi_to_km')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                directionFilter === 'mi_to_km'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              mi → km
            </button>
          </div>
        </div>

        {/* History Table / Empty State */}
        <div id="history-content-area" className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div
              id="history-empty-state"
              className="py-12 px-4 text-center text-slate-500 dark:text-slate-400"
            >
              <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {records.length === 0
                  ? 'No conversion logs yet'
                  : 'No conversions match your search filter'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {records.length === 0
                  ? 'Calculations you perform are automatically logged for instant review and export.'
                  : 'Try changing your search term or filter.'}
              </p>
            </div>
          ) : (
            <table
              id="table-conversion-history"
              className="w-full text-left text-xs border-collapse"
            >
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Input Value</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Converted Output</th>
                  <th className="py-3 px-4 hidden md:table-cell">Formula</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-sans">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    id={`history-row-${record.id}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Timestamp */}
                    <td
                      suppressHydrationWarning
                      className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]"
                    >
                      {formatDate(record.timestamp)}
                    </td>

                    {/* Input */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <span>{record.inputValue}</span>{' '}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {record.inputUnit}
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="py-3 px-4 whitespace-nowrap text-indigo-600 dark:text-indigo-400 font-bold">
                      {record.inputUnit === 'km' ? 'km → mi' : 'mi → km'}
                    </td>

                    {/* Converted Output */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      <span>{formatPrecision(record.outputValue, record.precision)}</span>{' '}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 uppercase">
                        {record.outputUnit}
                      </span>
                    </td>

                    {/* Formula */}
                    <td className="py-3 px-4 font-mono text-slate-400 dark:text-slate-500 hidden md:table-cell truncate max-w-xs text-[11px]">
                      {record.formula}
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        id={`btn-delete-row-${record.id}`}
                        onClick={() => deleteRecord(record.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete this record"
                        aria-label={`Delete record ${record.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
