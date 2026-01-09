# Guida Tecnica: Calcolo Esposizione Solare

## Panoramica

Il sistema di calcolo esposizione solare di OrtoMio calcola con precisione le ore di sole diretto che un orto riceve ogni giorno dell'anno, considerando ostacoli 3D (palazzi, alberi, montagne).

## Architettura

```
Foto 360° / Input Manuale
    ↓
Estrazione Ostacoli 3D
    ↓
Calcolatore Posizione Sole (giorno-per-giorno)
    ↓
Calcolo Ore Sole Diretto
    ↓
Calcolo Periodo Ottimale
    ↓
Visualizzazione Frontend
```

## Formule Matematiche

### 1. Declinazione Solare

La declinazione solare è l'angolo del sole rispetto all'equatore celeste:

```
declination = 23.45 * sin(360 * (284 + dayOfYear) / 365)
```

Dove `dayOfYear` è il giorno dell'anno (1-365/366).

### 2. Elevazione Solare

L'elevazione solare è l'angolo del sole sopra l'orizzonte:

```
elevation = asin(
  sin(lat) * sin(decl) + 
  cos(lat) * cos(decl) * cos(hourAngle)
)
```

Dove:
- `lat` = latitudine in radianti
- `decl` = declinazione solare in radianti
- `hourAngle` = 15° * (ora - 12) in radianti

### 3. Azimut Solare

L'azimut solare è la direzione del sole (0° = Nord, 90° = Est, 180° = Sud, 270° = Ovest):

```
azimuth = atan2(
  sin(hourAngle),
  cos(hourAngle) * sin(lat) - tan(decl) * cos(lat)
) + 180
```

### 4. Verifica Blocco Ostacolo

Per verificare se un ostacolo blocca il sole:

```
obstacleElevation = atan2(height, distance) * 180 / π

if (sunElevation < obstacleElevation && 
    azimuthDifference < obstacleWidthDegrees / 2) {
  // Sole bloccato
}
```

## Implementazione

### Servizi Principali

1. **`preciseSunCalculator.ts`**
   - `calculateSunPosition()`: Calcola posizione sole per data/ora
   - `calculateDailySunHours()`: Calcola ore sole per un giorno
   - `calculateMonthlySunHours()`: Calcola media mensile
   - `calculateOptimalPeriod()`: Trova periodo migliore

2. **`obstacleExtractor.ts`**
   - `extractObstaclesFrom360()`: Estrae ostacoli da foto 360°
   - `parseObstaclesFromManualInput()`: Crea ostacolo da input manuale
   - `mergeNearbyObstacles()`: Combina ostacoli vicini

3. **`sunExposureService.ts`**
   - `calculateSunExposure()`: Calcolo principale con fallback
   - `getGardenSunExposure()`: Ottiene esposizione per giardino
   - `getGardenOptimalPeriod()`: Ottiene periodo ottimale

### API Endpoints

- `GET /api/garden/sun-exposure?gardenId=xxx&date=2024-06-21`: Calcola esposizione per data
- `POST /api/garden/sun-exposure/monthly`: Calcola ore mensili
- `PUT /api/garden/sun-exposure/optimal-period`: Calcola periodo ottimale

### Database Schema

Tabella `garden_obstacles`:
- `azimuth`: Direzione (0-360°)
- `height_meters`: Altezza in metri
- `distance_meters`: Distanza orizzontale
- `width_degrees`: Larghezza angolare
- `type`: Building, Tree, Mountain, Other
- `source`: photo_360, manual, ai_analysis

## Best Practices

### Misurazione Ostacoli

1. **Altezza**:
   - Usa oggetti di riferimento (piano ≈ 3m)
   - App di misurazione con telefono
   - Google Earth per edifici

2. **Distanza**:
   - Google Maps per misurare distanze
   - Stima visiva (più grande = più vicino)
   - Per foto 360°: stima automatica basata su dimensione apparente

3. **Direzione**:
   - Usa bussola del telefono
   - Google Maps mostra direzione Nord
   - Per foto 360°: estrazione automatica

### Precisione

- **Time Step**: Default 10 minuti (bilanciamento precisione/performance)
- **Campionamento Mensile**: 5 giorni rappresentativi (10%, 30%, 50%, 70%, 90% del mese)
- **Cache**: Risultati mensili possono essere cachati per performance

### Ostacoli Speciali

- **Alberi Caducifoglie**: Considera due set di ostacoli (estate/inverno) o usa media
- **Ostacoli Mobili**: Non supportati, considera solo ostacoli fissi
- **Ostacoli Parziali**: Usa larghezza angolare per rappresentare copertura parziale

## Esempi Pratici

### Esempio 1: Orto Urbano con Palazzo

```
Ostacolo:
- Direzione: Nord (0°)
- Altezza: 18m
- Distanza: 12m
- Tipo: Building

Calcolo:
obstacleElevation = atan2(18, 12) = 56.3°

In inverno (dicembre), il sole a mezzogiorno ha elevazione ~25°
→ Sole bloccato tutto l'inverno

In estate (giugno), il sole a mezzogiorno ha elevazione ~70°
→ Sole non bloccato in estate
```

### Esempio 2: Orto con Albero a Sud

```
Ostacolo:
- Direzione: Sud (180°)
- Altezza: 8m
- Distanza: 15m
- Tipo: Tree

Calcolo:
obstacleElevation = atan2(8, 15) = 28.1°

Il sole passa principalmente da Sud
→ Riduce ore di sole soprattutto al mattino/sera quando il sole è basso
```

## Troubleshooting

### Problema: Ore di sole troppo basse

**Possibili cause**:
1. Ostacoli configurati troppo alti o troppo vicini
2. Latitudine molto alta (Nord Europa)
3. Data invernale (sole naturalmente basso)

**Soluzioni**:
- Verifica misure ostacoli
- Controlla calcolo per data estiva
- Considera che in inverno è normale avere meno sole

### Problema: Foto 360° non estrae ostacoli

**Possibili cause**:
1. Foto non è veramente 360°
2. Foto troppo scura/chiara
3. Ostacoli non visibili nella foto

**Soluzioni**:
- Assicurati che la foto copra tutto l'orizzonte
- Usa input manuale come alternativa
- Verifica qualità foto (risoluzione, illuminazione)

### Problema: Calcolo lento

**Possibili cause**:
1. Troppi ostacoli configurati
2. Time step troppo piccolo
3. Calcolo per molti giorni

**Soluzioni**:
- Riduci numero ostacoli (solo quelli principali)
- Aumenta time step a 15-20 minuti
- Cache risultati mensili

## Limitazioni

1. **Ostacoli Dinamici**: Non considera ostacoli che cambiano (es. alberi con foglie)
2. **Riflessi**: Non considera riflessi da superfici (es. vetri)
3. **Nuvolosità**: Calcola sole diretto teorico, non considera nuvole
4. **Microclima**: Non considera effetti di microclima locale

## Sviluppi Futuri

- Supporto per ostacoli stagionali (alberi caducifoglie)
- Calcolo considerando riflessi
- Integrazione con dati meteo reali
- Visualizzazione 3D interattiva degli ostacoli

