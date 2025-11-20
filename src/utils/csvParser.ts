import Papa from 'papaparse';
import { Match, Player } from '@/types/cricket';

export const parseCSV = <T>(csvText: string): T[] => {
  const result = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data as T[];
};

export const loadCSV = async (path: string): Promise<string> => {
  const response = await fetch(path);
  return await response.text();
};

export const loadMatches = async (format: 'T20I' | 'ODI' | 'Both'): Promise<Match[]> => {
  let path = '';
  if (format === 'T20I') path = '/src/data/nepal_t20i_matches.csv';
  else if (format === 'ODI') path = '/src/data/nepal_odi_matches.csv';
  else path = '/src/data/nepal_all_matches.csv';
  
  const csvText = await loadCSV(path);
  return parseCSV<Match>(csvText);
};

export const loadBatsmen = async (format: 'T20I' | 'ODI' | 'Both'): Promise<Player[]> => {
  let path = '';
  if (format === 'T20I') path = '/src/data/nepal_t20i_batsmen.csv';
  else if (format === 'ODI') path = '/src/data/nepal_odi_batsmen.csv';
  else path = '/src/data/nepal_top_batsmen.csv';
  
  const csvText = await loadCSV(path);
  return parseCSV<Player>(csvText);
};

export const loadBowlers = async (format: 'T20I' | 'ODI' | 'Both'): Promise<Player[]> => {
  let path = '';
  if (format === 'T20I') path = '/src/data/nepal_t20i_bowlers.csv';
  else if (format === 'ODI') path = '/src/data/nepal_odi_bowlers.csv';
  else path = '/src/data/nepal_top_bowlers.csv';
  
  const csvText = await loadCSV(path);
  return parseCSV<Player>(csvText);
};
