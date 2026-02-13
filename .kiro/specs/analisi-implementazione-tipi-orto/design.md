# Design Document: Analisi e Implementazione Colture Specializzate

## Metadata
- **Feature**: Analisi Completa Ciclo Vita Colture Specializzate
- **Phase**: Design & Analysis
- **Created**: 2026-02-13
- **Status**: In Progress

---

## 1. EXECUTIVE SUMMARY

### Obiettivo
Analizzare in profondità come le colture specializzate (idroponica, acquaponica, aeroponica, fragole) vengono create, gestite, monitorate e come i loro dati vengono utilizzati per analisi predittive e suggerimenti proattivi.

### Scope
- **In Scope**: Analisi completa ciclo di vita, mappatura componenti, identificazione gap
- **Out of Scope**: Implementazione codice (fase successiva)

### Approccio
1. Analisi per tipo di coltivazione
2. Mappatura ciclo di vita (7 fasi)
3. Inventario componenti esistenti
4. Identificazione gap
5. Piano implementazione prioritizzato

---

## 2. ANALISI PER TIPO DI COLTIVAZIONE

### 2.1 IDROPONICA (6 Sistemi)

#### Sistemi Supportati
1. **NFT** (Nutrient Film Technique)
2. **DWC** (Deep Water Culture)
3. **Ebb & Flow** (Flood and Drain)
4. **Drip** (Drip System)
5. **Wick** (Wick System)
6. **Kratky** (Passive Method)

#### Componenti Esistenti

**Types & Interfaces**:
```typescript
// types/indoorGrowing.ts
export interface HydroponicSystemConfig {
  systemType: HydroponicSystemType;
  reservoir: {
    volumeLiters: number;
    material: string;
  };
  growingArea: {
    lengthCm: number;
    widthCm: number;
    plantCapacity: number;
  };
  // ... altri campi
}
```

**Database**:
- Tabella: `hydroponic_readings`
- Campi: `id`, `garden_id`, `reading_date`, `ph`, `ec`, `water_temp`, `reservoir_volume`, `notes`
- JSONB in `gardens`: `hydroponic_config`
- JSONB in `garden_tasks`: `hydroponic_data`

**Storage Services**:
