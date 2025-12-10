/**
 * Soil Indicators Database
 * Database delle piante spontanee che indicano caratteristiche del terreno
 */

import { SoilType } from '../types';

export interface SoilIndicatorPlant {
  name: string;
  scientificName: string;
  indicates: {
    soilType?: SoilType[];
    phRange?: { min: number; max: number };
    nutrientLevel?: 'poor' | 'medium' | 'rich';
    moisture?: 'dry' | 'medium' | 'wet';
  };
}

export const soilIndicators: SoilIndicatorPlant[] = [
  {
    name: 'Felce',
    scientificName: 'Pteridium aquilinum',
    indicates: {
      phRange: { min: 4.5, max: 6.0 },
      moisture: 'wet',
      soilType: ['Loamy', 'Peaty'],
      nutrientLevel: 'medium',
    },
  },
  {
    name: 'Erica',
    scientificName: 'Calluna vulgaris',
    indicates: {
      phRange: { min: 4.0, max: 5.5 },
      soilType: ['Peaty'],
      nutrientLevel: 'poor',
    },
  },
  {
    name: 'Papavero',
    scientificName: 'Papaver rhoeas',
    indicates: {
      phRange: { min: 7.0, max: 8.5 },
      soilType: ['Chalky', 'Clay'],
      nutrientLevel: 'medium',
    },
  },
  {
    name: 'Ortica',
    scientificName: 'Urtica dioica',
    indicates: {
      nutrientLevel: 'rich', // Alto azoto
      moisture: 'medium',
      phRange: { min: 6.5, max: 7.5 },
      soilType: ['Loamy'],
    },
  },
  {
    name: 'Tarassaco',
    scientificName: 'Taraxacum officinale',
    indicates: {
      soilType: ['Clay'],
      phRange: { min: 6.0, max: 7.5 },
      nutrientLevel: 'medium',
    },
  },
  {
    name: 'Trifoglio',
    scientificName: 'Trifolium repens',
    indicates: {
      nutrientLevel: 'poor', // Fissa azoto, quindi indica terreno povero
      phRange: { min: 6.0, max: 7.0 },
      soilType: ['Loamy', 'Sandy'],
    },
  },
  {
    name: 'Equiseto',
    scientificName: 'Equisetum arvense',
    indicates: {
      phRange: { min: 5.0, max: 6.5 },
      moisture: 'wet',
      soilType: ['Clay', 'Loamy'],
      nutrientLevel: 'medium',
    },
  },
  {
    name: 'Piantaggine',
    scientificName: 'Plantago major',
    indicates: {
      phRange: { min: 6.0, max: 7.5 },
      soilType: ['Clay', 'Loamy'],
      nutrientLevel: 'medium',
      moisture: 'medium',
    },
  },
  {
    name: 'Achillea',
    scientificName: 'Achillea millefolium',
    indicates: {
      phRange: { min: 6.0, max: 7.5 },
      soilType: ['Sandy', 'Loamy'],
      nutrientLevel: 'poor',
    },
  },
  {
    name: 'Camomilla',
    scientificName: 'Matricaria chamomilla',
    indicates: {
      phRange: { min: 6.5, max: 7.5 },
      soilType: ['Loamy'],
      nutrientLevel: 'medium',
    },
  },
  {
    name: 'Bardana',
    scientificName: 'Arctium lappa',
    indicates: {
      phRange: { min: 6.0, max: 7.5 },
      soilType: ['Clay'],
      nutrientLevel: 'rich',
      moisture: 'medium',
    },
  },
  {
    name: 'Consolida',
    scientificName: 'Symphytum officinale',
    indicates: {
      phRange: { min: 6.0, max: 7.5 },
      moisture: 'wet',
      soilType: ['Clay', 'Loamy'],
      nutrientLevel: 'rich',
    },
  },
];

