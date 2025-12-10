/**
 * Plant pH Requirements Database
 * Database dei requisiti pH per le piante comuni
 */

import { PHRequirement } from '../logic/soilPHEngine';

export const plantPHData: Record<string, PHRequirement> = {
  // Piante acidofile (pH 4.5-6.0)
  'azalea': {
    ideal: { min: 4.5, max: 5.5 },
    tolerable: { min: 4.0, max: 6.0 },
    category: 'acidophilic',
  },
  'rododendro': {
    ideal: { min: 4.5, max: 5.5 },
    tolerable: { min: 4.0, max: 6.0 },
    category: 'acidophilic',
  },
  'mirtillo': {
    ideal: { min: 4.5, max: 5.5 },
    tolerable: { min: 4.0, max: 6.0 },
    category: 'acidophilic',
  },
  'lampone': {
    ideal: { min: 5.5, max: 6.5 },
    tolerable: { min: 5.0, max: 7.0 },
    category: 'acidophilic',
  },
  'fragola': {
    ideal: { min: 5.5, max: 6.5 },
    tolerable: { min: 5.0, max: 7.0 },
    category: 'acidophilic',
  },
  'patata': {
    ideal: { min: 5.0, max: 6.0 },
    tolerable: { min: 4.5, max: 6.5 },
    category: 'acidophilic',
  },

  // Piante neutre (pH 6.0-7.5)
  'pomodoro': {
    ideal: { min: 6.0, max: 6.8 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'peperone': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'melanzana': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'zucchina': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'cetriolo': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'lattuga': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'spinaci': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'carota': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'cipolla': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'aglio': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'fagiolo': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'pisello': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'cavolo': {
    ideal: { min: 6.5, max: 7.5 },
    tolerable: { min: 6.0, max: 8.0 },
    category: 'neutral',
  },
  'broccoli': {
    ideal: { min: 6.5, max: 7.5 },
    tolerable: { min: 6.0, max: 8.0 },
    category: 'neutral',
  },
  'cavolfiore': {
    ideal: { min: 6.5, max: 7.5 },
    tolerable: { min: 6.0, max: 8.0 },
    category: 'neutral',
  },
  'ravanello': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'basilico': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'prezzemolo': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'rosmarino': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },
  'salvia': {
    ideal: { min: 6.0, max: 7.0 },
    tolerable: { min: 5.5, max: 7.5 },
    category: 'neutral',
  },

  // Piante alcaline (pH 7.0-8.5)
  'ulivo': {
    ideal: { min: 7.0, max: 8.5 },
    tolerable: { min: 6.5, max: 9.0 },
    category: 'alkaline',
  },
  'vite': {
    ideal: { min: 6.5, max: 8.0 },
    tolerable: { min: 6.0, max: 8.5 },
    category: 'alkaline',
  },
  'asparago': {
    ideal: { min: 6.5, max: 8.0 },
    tolerable: { min: 6.0, max: 8.5 },
    category: 'alkaline',
  },
  'barbabietola': {
    ideal: { min: 6.5, max: 7.5 },
    tolerable: { min: 6.0, max: 8.0 },
    category: 'alkaline',
  },
  'cavolo cappuccio': {
    ideal: { min: 6.5, max: 7.5 },
    tolerable: { min: 6.0, max: 8.0 },
    category: 'alkaline',
  },
};

