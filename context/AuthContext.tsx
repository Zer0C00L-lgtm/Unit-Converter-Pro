'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback } from 'react';
import { ConversionDirection, UserAccount } from '@/types/converter';

interface AuthContextType {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  isAuthenticated: boolean;
  signIn: (email: string, pass: string) => { success: boolean; error?: string };
  signUp: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  signInAsGuest: () => void;
  signOut: () => void;
  switchUser: (userId: string) => void;
  updatePreferences: (updates: {
    defaultPrecision?: number;
    defaultDirection?: ConversionDirection;
    name?: string;
  }) => void;
}

const STORAGE_USERS_KEY = 'distance_unit_converter_users';
const STORAGE_CURRENT_USER_KEY = 'distance_unit_converter_current_user';
const STORAGE_PASS_KEY_PREFIX = 'distance_unit_converter_pass_';

const DEFAULT_DEMO_USER: UserAccount = {
  id: 'usr_demo_primary',
  email: 'stanley.remy@pursuit.org',
  name: 'Stanley Remy',
  createdAt: 1724000000000,
  lastLogin: 1724580000000,
  defaultPrecision: 4,
  defaultDirection: 'km_to_mi',
  isGuest: false,
};

interface AuthStoreState {
  allUsers: UserAccount[];
  currentUser: UserAccount;
}

const DEFAULT_AUTH_STATE: AuthStoreState = {
  allUsers: [DEFAULT_DEMO_USER],
  currentUser: DEFAULT_DEMO_USER,
};

let cachedAuthState: AuthStoreState = DEFAULT_AUTH_STATE;
let cachedRawUsers: string | null = null;
let cachedRawCurrent: string | null = null;

const authListeners = new Set<() => void>();

function subscribeAuth(callback: () => void) {
  authListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    authListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getAuthSnapshot(): AuthStoreState {
  if (typeof window === 'undefined') return DEFAULT_AUTH_STATE;
  try {
    const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
    const rawCurrent = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (rawUsers === cachedRawUsers && rawCurrent === cachedRawCurrent) {
      return cachedAuthState;
    }
    let allUsers = [DEFAULT_DEMO_USER];
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allUsers = parsed;
      }
    }
    let currentUser = allUsers[0] || DEFAULT_DEMO_USER;
    if (rawCurrent) {
      const parsedCurrent = JSON.parse(rawCurrent);
      if (parsedCurrent && parsedCurrent.id) {
        currentUser = parsedCurrent;
      }
    }
    cachedRawUsers = rawUsers;
    cachedRawCurrent = rawCurrent;
    cachedAuthState = { allUsers, currentUser };
    return cachedAuthState;
  } catch {
    return cachedAuthState;
  }
}

function getAuthServerSnapshot(): AuthStoreState {
  return DEFAULT_AUTH_STATE;
}

function notifyAuthListeners() {
  authListeners.forEach((listener) => listener());
}

function persistAuthState(user: UserAccount, usersList: UserAccount[]) {
  try {
    const usersStr = JSON.stringify(usersList);
    const userStr = JSON.stringify(user);
    localStorage.setItem(STORAGE_USERS_KEY, usersStr);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, userStr);
    cachedRawUsers = usersStr;
    cachedRawCurrent = userStr;
    cachedAuthState = { allUsers: usersList, currentUser: user };
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  notifyAuthListeners();
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { allUsers, currentUser } = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const isAuthenticated = !currentUser.isGuest;

  const signIn = useCallback(
    (email: string, pass: string): { success: boolean; error?: string } => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return { success: false, error: 'Please enter an email address.' };
      }

      const existingUser = allUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!existingUser) {
        return {
          success: false,
          error: 'No account found with this email. Please Sign Up first.',
        };
      }

      const savedPass = localStorage.getItem(STORAGE_PASS_KEY_PREFIX + existingUser.id);
      if (savedPass && savedPass !== pass) {
        return { success: false, error: 'Incorrect password or passcode.' };
      }

      const updatedUser: UserAccount = {
        ...existingUser,
        lastLogin: Date.now(),
      };

      const updatedList = allUsers.map((u) => (u.id === existingUser.id ? updatedUser : u));
      persistAuthState(updatedUser, updatedList);
      return { success: true };
    },
    [allUsers]
  );

  const signUp = useCallback(
    (name: string, email: string, pass: string): { success: boolean; error?: string } => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      if (!trimmedEmail || !trimmedName) {
        return { success: false, error: 'Please provide both your name and email.' };
      }

      if (allUsers.some((u) => u.email.toLowerCase() === trimmedEmail)) {
        return {
          success: false,
          error: 'An account with this email already exists. Please Sign In.',
        };
      }

      const newUser: UserAccount = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        email: trimmedEmail,
        name: trimmedName,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        defaultPrecision: 4,
        defaultDirection: 'km_to_mi',
        isGuest: false,
      };

      try {
        localStorage.setItem(STORAGE_PASS_KEY_PREFIX + newUser.id, pass);
      } catch (e) {
        console.warn('Could not store pass:', e);
      }

      const updatedList = [newUser, ...allUsers];
      persistAuthState(newUser, updatedList);
      return { success: true };
    },
    [allUsers]
  );

  const signInAsGuest = useCallback(() => {
    const guestUser: UserAccount = {
      id: 'guest_' + Date.now(),
      email: 'guest@converter.local',
      name: 'Guest User',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      defaultPrecision: 3,
      defaultDirection: 'km_to_mi',
      isGuest: true,
    };

    const updatedList = [guestUser, ...allUsers.filter((u) => !u.isGuest)];
    persistAuthState(guestUser, updatedList);
  }, [allUsers]);

  const signOut = useCallback(() => {
    signInAsGuest();
  }, [signInAsGuest]);

  const switchUser = useCallback(
    (userId: string) => {
      const target = allUsers.find((u) => u.id === userId);
      if (target) {
        const updatedUser = { ...target, lastLogin: Date.now() };
        const updatedList = allUsers.map((u) => (u.id === target.id ? updatedUser : u));
        persistAuthState(updatedUser, updatedList);
      }
    },
    [allUsers]
  );

  const updatePreferences = useCallback(
    (updates: {
      defaultPrecision?: number;
      defaultDirection?: ConversionDirection;
      name?: string;
    }) => {
      const updatedUser = {
        ...currentUser,
        ...updates,
      };
      const updatedList = allUsers.map((u) => (u.id === currentUser.id ? updatedUser : u));
      persistAuthState(updatedUser, updatedList);
    },
    [allUsers, currentUser]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthenticated,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        switchUser,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

