'use client';

import React, { createContext, useContext, useState, useSyncExternalStore, useCallback, useMemo } from 'react';
import { ConversionDirection, ConversionRecord, ConversionStats } from '@/types/converter';
import { downloadCSV } from '@/lib/converter';
import { useAuth } from './AuthContext';

interface HistoryContextType {
  records: ConversionRecord[];
  allUserRecords: ConversionRecord[];
  filteredRecords: ConversionRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  directionFilter: 'all' | ConversionDirection;
  setDirectionFilter: (d: 'all' | ConversionDirection) => void;
  addRecord: (record: Omit<ConversionRecord, 'id' | 'timestamp' | 'userId'>) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
  exportCSV: (recordsToExport?: ConversionRecord[]) => boolean;
  stats: ConversionStats;
}

const STORAGE_HISTORY_KEY = 'distance_unit_converter_history_v1';

const INITIAL_SAMPLE_RECORDS: ConversionRecord[] = [
  {
    id: 'rec_sample_1',
    userId: 'usr_demo_primary',
    timestamp: 1724580000000,
    inputValue: 5,
    inputUnit: 'km',
    outputValue: 3.106856,
    outputUnit: 'mi',
    precision: 4,
    formula: '5 km × 0.621371 = 3.1069 mi',
    note: '5K Parkrun morning route',
  },
  {
    id: 'rec_sample_2',
    userId: 'usr_demo_primary',
    timestamp: 1724570000000,
    inputValue: 26.21875,
    inputUnit: 'mi',
    outputValue: 42.195,
    outputUnit: 'km',
    precision: 4,
    formula: '26.22 mi × 1.609344 = 42.1950 km',
    note: 'Official Marathon distance check',
  },
  {
    id: 'rec_sample_3',
    userId: 'usr_demo_primary',
    timestamp: 1724500000000,
    inputValue: 100,
    inputUnit: 'km',
    outputValue: 62.1371,
    outputUnit: 'mi',
    precision: 2,
    formula: '100 km × 0.621371 = 62.14 mi',
    note: 'Highway speed limit comparison',
  },
];

let cachedHistoryState: ConversionRecord[] = INITIAL_SAMPLE_RECORDS;
let cachedRawHistoryString: string | null = null;
const historyListeners = new Set<() => void>();

function subscribeHistory(callback: () => void) {
  historyListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    historyListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getHistorySnapshot(): ConversionRecord[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (raw === cachedRawHistoryString) {
      return cachedHistoryState;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedRawHistoryString = raw;
        cachedHistoryState = parsed;
        return cachedHistoryState;
      }
    }
  } catch {
    // ignore
  }
  return cachedHistoryState;
}

function getHistoryServerSnapshot(): ConversionRecord[] {
  return INITIAL_SAMPLE_RECORDS;
}

function notifyHistoryListeners() {
  historyListeners.forEach((listener) => listener());
}

function persistHistoryState(records: ConversionRecord[]) {
  try {
    const raw = JSON.stringify(records);
    localStorage.setItem(STORAGE_HISTORY_KEY, raw);
    cachedRawHistoryString = raw;
    cachedHistoryState = records;
  } catch (e) {
    console.error('Failed to save conversion history to localStorage', e);
  }
  notifyHistoryListeners();
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const allHistory = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | ConversionDirection>('all');

  // Filter records specifically for the currently logged in user
  const userRecords = useMemo(
    () => allHistory.filter((r) => r.userId === currentUser.id),
    [allHistory, currentUser.id]
  );

  const filteredRecords = useMemo(() => {
    return userRecords.filter((rec) => {
      if (directionFilter === 'km_to_mi' && rec.inputUnit !== 'km') return false;
      if (directionFilter === 'mi_to_km' && rec.inputUnit !== 'mi') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchesInput = rec.inputValue.toString().includes(q);
      const matchesOutput = rec.outputValue.toString().includes(q);
      const matchesFormula = rec.formula.toLowerCase().includes(q);
      const matchesNote = rec.note ? rec.note.toLowerCase().includes(q) : false;

      return matchesInput || matchesOutput || matchesFormula || matchesNote;
    });
  }, [userRecords, directionFilter, searchQuery]);

  const addRecord = useCallback(
    (item: Omit<ConversionRecord, 'id' | 'timestamp' | 'userId'>) => {
      const currentList = getHistorySnapshot();
      const userRecs = currentList.filter((r) => r.userId === currentUser.id);
      const isDuplicate =
        userRecs.length > 0 &&
        userRecs[0].inputValue === item.inputValue &&
        userRecs[0].inputUnit === item.inputUnit &&
        userRecs[0].precision === item.precision &&
        Date.now() - userRecs[0].timestamp < 3000;

      if (isDuplicate) return;

      const newRecord: ConversionRecord = {
        ...item,
        id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        userId: currentUser.id,
      };

      const updated = [newRecord, ...currentList];
      persistHistoryState(updated);
    },
    [currentUser.id]
  );

  const deleteRecord = useCallback((id: string) => {
    const currentList = getHistorySnapshot();
    const updated = currentList.filter((r) => r.id !== id);
    persistHistoryState(updated);
  }, []);

  const clearHistory = useCallback(() => {
    const currentList = getHistorySnapshot();
    const updated = currentList.filter((r) => r.userId !== currentUser.id);
    persistHistoryState(updated);
  }, [currentUser.id]);

  const exportCSV = useCallback(
    (customRecords?: ConversionRecord[]): boolean => {
      const recordsToExport = customRecords || (userRecords.length > 0 ? userRecords : allHistory);
      if (!recordsToExport || recordsToExport.length === 0) return false;
      const sanitizedName = currentUser.name.toLowerCase().replace(/\s+/g, '_');
      return downloadCSV(recordsToExport, `${sanitizedName}_distance_conversions.csv`);
    },
    [allHistory, currentUser.name, userRecords]
  );

  // Stats calculation
  const stats: ConversionStats = useMemo(() => {
    return {
      totalCount: userRecords.length,
      kmToMiCount: userRecords.filter((r) => r.inputUnit === 'km').length,
      miToKmCount: userRecords.filter((r) => r.inputUnit === 'mi').length,
      totalKmConverted: userRecords.reduce((acc, r) => {
        return acc + (r.inputUnit === 'km' ? r.inputValue : r.outputValue);
      }, 0),
      totalMiConverted: userRecords.reduce((acc, r) => {
        return acc + (r.inputUnit === 'mi' ? r.inputValue : r.outputValue);
      }, 0),
    };
  }, [userRecords]);

  return (
    <HistoryContext.Provider
      value={{
        records: userRecords,
        allUserRecords: allHistory,
        filteredRecords,
        searchQuery,
        setSearchQuery,
        directionFilter,
        setDirectionFilter,
        addRecord,
        deleteRecord,
        clearHistory,
        exportCSV,
        stats,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
