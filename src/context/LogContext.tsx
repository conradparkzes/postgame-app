import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Sport } from '@/src/types';

export interface LogDraft {
  // From API or manual entry
  api_game_id?: string;
  sport?: Sport;
  league?: string;
  home_team?: string;
  away_team?: string;
  home_score?: number | null;
  away_score?: number | null;
  game_date?: string;        // YYYY-MM-DD
  venue_name?: string;
  venue_city?: string;
  venue_country?: string;
  api_venue_id?: string;
  // User-entered
  seat_section?: string;
  seat_row?: string;
  seat_number?: string;
  atmosphere_rating?: number;
  seating_rating?: number;
  food_rating?: number;
  accessibility_rating?: number;
  notes?: string;
  companions?: string[];
  // Local only — uploaded to Supabase Storage, not saved directly
  mediaUris?: string[];
  // Set after save — used by confirmation screen to link to game detail
  savedGameLogId?: string;
}

interface LogContextValue {
  draft: LogDraft;
  updateDraft: (patch: Partial<LogDraft>) => void;
  resetDraft: () => void;
}

const LogContext = createContext<LogContextValue>({
  draft: {},
  updateDraft: () => {},
  resetDraft: () => {},
});

export function LogProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<LogDraft>({});

  function updateDraft(patch: Partial<LogDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function resetDraft() {
    setDraft({});
  }

  return (
    <LogContext.Provider value={{ draft, updateDraft, resetDraft }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogDraft() {
  return useContext(LogContext);
}
