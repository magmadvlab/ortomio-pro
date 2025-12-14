(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/packages/core/config/tiers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tier Configuration System
 * Defines Free and Pro tiers with their limits and features
 */ __turbopack_context__.s([
    "AppTier",
    ()=>AppTier,
    "FREE_TIER",
    ()=>FREE_TIER,
    "PRO_CONSUMER_TIER",
    ()=>PRO_CONSUMER_TIER,
    "PRO_PROFESSIONAL_TIER",
    ()=>PRO_PROFESSIONAL_TIER,
    "PRO_TIER",
    ()=>PRO_TIER,
    "getTierConfig",
    ()=>getTierConfig
]);
var AppTier = /*#__PURE__*/ function(AppTier) {
    AppTier["FREE"] = "FREE";
    AppTier["PRO"] = "PRO";
    AppTier["PRO_CONSUMER"] = "PRO_CONSUMER";
    AppTier["PRO_PROFESSIONAL"] = "PRO_PROFESSIONAL";
    return AppTier;
}({});
const FREE_TIER = {
    tier: "FREE",
    name: 'Free',
    limits: {
        maxGardens: 1,
        maxTasksPerGarden: 50,
        maxSeedPackets: 20,
        maxHarvestLogs: 100,
        maxSeedlingBatches: 3,
        maxPhotosPerBatch: 5
    },
    features: {
        // Core Features
        basicPlanner: true,
        basicJournal: true,
        basicHarvestLog: true,
        seedInventory: true,
        lunarCalendar: true,
        lifecycleEngine: true,
        nutrientEngine: true,
        healthEngine: true,
        // Pro Features (disabled)
        visualGardenPlanner: false,
        photoTimeLapse: false,
        harvestAnalytics: false,
        advancedWeather: false,
        photoOnboarding: false,
        diseaseDiagnosis: false,
        seedlingManagement: false,
        annualPlanner: false,
        specializedCrops: false,
        rotationEngine: false,
        companionPlanting: false,
        cloudSync: false,
        exportData: false
    }
};
const PRO_TIER = {
    tier: "PRO",
    name: 'Pro',
    limits: {
        maxGardens: -1,
        maxTasksPerGarden: -1,
        maxSeedPackets: -1,
        maxHarvestLogs: -1,
        maxPhotoLogs: -1,
        maxSeedlingBatches: -1,
        maxPhotosPerBatch: -1
    },
    features: {
        // Core Features
        basicPlanner: true,
        basicJournal: true,
        basicHarvestLog: true,
        seedInventory: true,
        lunarCalendar: true,
        lifecycleEngine: true,
        nutrientEngine: true,
        healthEngine: true,
        // Pro Features (all enabled)
        visualGardenPlanner: true,
        photoTimeLapse: true,
        harvestAnalytics: true,
        advancedWeather: true,
        photoOnboarding: true,
        diseaseDiagnosis: true,
        seedlingManagement: true,
        annualPlanner: true,
        specializedCrops: true,
        rotationEngine: true,
        companionPlanting: true,
        cloudSync: true,
        exportData: true,
        // Consumer Features (legacy PRO has these)
        recipes: true,
        guides: true,
        community: true,
        // Professional Features (legacy PRO has basic versions)
        advancedAnalytics: false,
        treatmentRegister: false,
        nutrientCalculator: false,
        cropRotation: true,
        exportCSV: false,
        exportPDF: false
    }
};
const PRO_CONSUMER_TIER = {
    tier: "PRO_CONSUMER",
    name: 'Pro Consumer',
    limits: {
        maxGardens: -1,
        maxTasksPerGarden: -1,
        maxSeedPackets: -1,
        maxHarvestLogs: -1,
        maxPhotoLogs: -1,
        maxSeedlingBatches: -1,
        maxPhotosPerBatch: -1
    },
    features: {
        // Core Features
        basicPlanner: true,
        basicJournal: true,
        basicHarvestLog: true,
        seedInventory: true,
        lunarCalendar: true,
        lifecycleEngine: true,
        nutrientEngine: true,
        healthEngine: true,
        // Pro Features (all enabled)
        visualGardenPlanner: true,
        photoTimeLapse: true,
        harvestAnalytics: true,
        advancedWeather: true,
        photoOnboarding: true,
        diseaseDiagnosis: true,
        seedlingManagement: true,
        annualPlanner: true,
        specializedCrops: true,
        rotationEngine: true,
        companionPlanting: true,
        cloudSync: true,
        exportData: true,
        // Consumer Features (ENABLED)
        recipes: true,
        guides: true,
        community: true,
        // Professional Features (DISABLED)
        advancedAnalytics: false,
        treatmentRegister: false,
        nutrientCalculator: false,
        cropRotation: true,
        exportCSV: false,
        exportPDF: false
    }
};
const PRO_PROFESSIONAL_TIER = {
    tier: "PRO_PROFESSIONAL",
    name: 'Pro Professional',
    limits: {
        maxGardens: -1,
        maxTasksPerGarden: -1,
        maxSeedPackets: -1,
        maxHarvestLogs: -1,
        maxPhotoLogs: -1,
        maxSeedlingBatches: -1,
        maxPhotosPerBatch: -1
    },
    features: {
        // Core Features
        basicPlanner: true,
        basicJournal: true,
        basicHarvestLog: true,
        seedInventory: true,
        lunarCalendar: true,
        lifecycleEngine: true,
        nutrientEngine: true,
        healthEngine: true,
        // Pro Features (all enabled)
        visualGardenPlanner: true,
        photoTimeLapse: true,
        harvestAnalytics: true,
        advancedWeather: true,
        photoOnboarding: true,
        diseaseDiagnosis: true,
        seedlingManagement: true,
        annualPlanner: true,
        specializedCrops: true,
        rotationEngine: true,
        companionPlanting: true,
        cloudSync: true,
        exportData: true,
        // Consumer Features (DISABLED - no recipes for professionals)
        recipes: false,
        guides: false,
        community: false,
        // Professional Features (ENABLED)
        advancedAnalytics: true,
        treatmentRegister: true,
        nutrientCalculator: true,
        cropRotation: true,
        exportCSV: true,
        exportPDF: true
    }
};
const getTierConfig = (tier)=>{
    switch(tier){
        case "PRO":
        case 'PRO':
            return PRO_TIER;
        case "PRO_CONSUMER":
        case 'PRO_CONSUMER':
            return PRO_CONSUMER_TIER;
        case "PRO_PROFESSIONAL":
        case 'PRO_PROFESSIONAL':
            return PRO_PROFESSIONAL_TIER;
        case "FREE":
        case 'FREE':
        default:
            return FREE_TIER;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/context/TierContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tier Context Provider
 * Manages app tier state (Free/Pro) and provides it to all components
 */ __turbopack_context__.s([
    "TierContext",
    ()=>TierContext,
    "TierProvider",
    ()=>TierProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/config/tiers.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const TierContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const TIER_STORAGE_KEY = 'ortomio_tier';
const TierProvider = ({ children, defaultTier = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].FREE })=>{
    _s();
    const [tier, setTierState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TierProvider.useState": ()=>{
            // LOCALE: Forza PRO_PROFESSIONAL in sviluppo locale
            const isLocalDev = ("TURBOPACK compile-time value", "object") !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || ("TURBOPACK compile-time value", "development") === 'development');
            if ("TURBOPACK compile-time truthy", 1) {
                // In locale, forza sempre PRO_PROFESSIONAL (il tier più completo)
                return __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO_PROFESSIONAL;
            }
            //TURBOPACK unreachable
            ;
        }
    }["TierProvider.useState"]);
    // Persist to localStorage when tier changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TierProvider.useEffect": ()=>{
            try {
                localStorage.setItem(TIER_STORAGE_KEY, tier);
            } catch (e) {
                console.error('Error saving tier to localStorage', e);
            }
        }
    }["TierProvider.useEffect"], [
        tier
    ]);
    const setTier = (newTier)=>{
        setTierState(newTier);
    };
    const isConsumer = ()=>{
        return tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO_CONSUMER || tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO; // Legacy PRO is treated as Consumer
    };
    const isProfessional = ()=>{
        return tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO_PROFESSIONAL;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TierContext.Provider, {
        value: {
            tier,
            setTier,
            isConsumer,
            isProfessional
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/core/context/TierContext.tsx",
        lineNumber: 81,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(TierProvider, "okaCcXbI0Uy8/SqxT+10wJL97Gk=");
_c = TierProvider;
;
var _c;
__turbopack_context__.k.register(_c, "TierProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/storageService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized localStorage service
 * This will be replaced by IStorageProvider in Phase 2
 */ __turbopack_context__.s([
    "StorageService",
    ()=>StorageService
]);
const STORAGE_KEYS = {
    GARDENS: 'ortoGardens',
    TASKS: 'ortoTasks',
    ACTIVE_GARDEN_ID: 'ortoActiveGardenId',
    DEVICES: 'ortoDevices',
    OLD_PROFILE: 'ortoProfile'
};
class StorageService {
    // Gardens
    static getGardens() {
        const saved = localStorage.getItem(STORAGE_KEYS.GARDENS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing gardens from localStorage', e);
            return [];
        }
    }
    static saveGardens(gardens) {
        try {
            localStorage.setItem(STORAGE_KEYS.GARDENS, JSON.stringify(gardens));
        } catch (e) {
            console.error('Error saving gardens to localStorage', e);
        }
    }
    // Tasks
    static getTasks() {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing tasks from localStorage', e);
            return [];
        }
    }
    static saveTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks to localStorage', e);
        }
    }
    // Active Garden ID
    static getActiveGardenId() {
        return localStorage.getItem(STORAGE_KEYS.ACTIVE_GARDEN_ID);
    }
    static saveActiveGardenId(gardenId) {
        try {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_GARDEN_ID, gardenId);
        } catch (e) {
            console.error('Error saving active garden ID to localStorage', e);
        }
    }
    // Smart Devices
    static getDevices() {
        const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing devices from localStorage', e);
            return [];
        }
    }
    static saveDevices(devices) {
        try {
            localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
        } catch (e) {
            console.error('Error saving devices to localStorage', e);
        }
    }
    // Legacy migration helpers
    static getOldProfile() {
        const saved = localStorage.getItem(STORAGE_KEYS.OLD_PROFILE);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing old profile from localStorage', e);
            return null;
        }
    }
    // Generic helpers
    static clearAll() {
        Object.values(STORAGE_KEYS).forEach((key)=>{
            localStorage.removeItem(key);
        });
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/exportService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Export Service
 * Export completo dati giardino per backup e portabilità
 */ __turbopack_context__.s([
    "downloadExport",
    ()=>downloadExport,
    "exportGardenData",
    ()=>exportGardenData
]);
const exportGardenData = async (gardenId, storage)=>{
    // Recupera tutti i dati
    const gardens = await storage.getGardens();
    const garden = gardens.find((g)=>g.id === gardenId);
    if (!garden) {
        throw new Error(`Giardino con ID ${gardenId} non trovato`);
    }
    const tasks = await storage.getTasks();
    const gardenTasks = tasks.filter((t)=>t.gardenId === gardenId);
    const harvests = await storage.getHarvestLogs(gardenId);
    const seeds = await storage.getSeedPackets(gardenId);
    // Costruisci oggetto export
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        garden,
        tasks: gardenTasks,
        harvests,
        seedInventory: seeds,
        metadata: {
            totalTasks: gardenTasks.length,
            totalHarvests: harvests.length,
            totalSeeds: seeds.length
        }
    };
    // Converti in JSON e crea Blob
    const json = JSON.stringify(exportData, null, 2);
    return new Blob([
        json
    ], {
        type: 'application/json'
    });
};
const downloadExport = async (gardenId, storage, filename)=>{
    const blob = await exportGardenData(gardenId, storage);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `ortomio-export-${gardenId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/autoBackupService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Auto Backup Service
 * Salva automaticamente backup dopo operazioni importanti
 * Mantiene ultimi N backup in localStorage
 */ __turbopack_context__.s([
    "cleanOldBackups",
    ()=>cleanOldBackups,
    "getBackup",
    ()=>getBackup,
    "getBackupMetadata",
    ()=>getBackupMetadata,
    "getBackups",
    ()=>getBackups,
    "getLastBackup",
    ()=>getLastBackup,
    "getLatestBackup",
    ()=>getLatestBackup,
    "restoreBackup",
    ()=>restoreBackup,
    "restoreFromExportData",
    ()=>restoreFromExportData,
    "saveAutoBackup",
    ()=>saveAutoBackup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$exportService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/exportService.ts [app-client] (ecmascript)");
;
const BACKUP_STORAGE_KEY = 'ortomio_auto_backups';
const MAX_BACKUPS = 10;
const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minuti - debounce per evitare troppe scritture
let lastBackupTime = 0;
let backupTimer = null;
async function saveAutoBackup(storage, gardenId) {
    const now = Date.now();
    // Debounce: salva solo se passati almeno BACKUP_INTERVAL ms dall'ultimo backup
    if (now - lastBackupTime < BACKUP_INTERVAL) {
        // Cancella timer precedente e programma nuovo backup
        if (backupTimer) {
            clearTimeout(backupTimer);
        }
        backupTimer = setTimeout(()=>{
            performBackup(storage, gardenId);
        }, BACKUP_INTERVAL - (now - lastBackupTime));
        return;
    }
    await performBackup(storage, gardenId);
}
/**
 * Esegue effettivamente il backup
 */ async function performBackup(storage, gardenId) {
    try {
        lastBackupTime = Date.now();
        const gardens = await storage.getGardens();
        // Se specificato gardenId, backup solo di quel giardino
        // Altrimenti backup di tutti i giardini
        const gardensToBackup = gardenId ? gardens.filter((g)=>g.id === gardenId) : gardens;
        if (gardensToBackup.length === 0) {
            return; // Nessun giardino da salvare
        }
        // Per ogni giardino, crea un backup separato
        for (const garden of gardensToBackup){
            const exportBlob = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$exportService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportGardenData"])(garden.id, storage);
            const exportText = await exportBlob.text();
            const exportData = JSON.parse(exportText);
            // Comprimi JSON (rimuovi spazi)
            const compressedJson = JSON.stringify(exportData);
            const backup = {
                id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                gardenId: garden.id,
                gardenName: garden.name,
                size: new Blob([
                    compressedJson
                ]).size,
                version: exportData.version || '1.0',
                data: exportData
            };
            // Salva backup
            const backups = getBackups();
            backups.push(backup);
            // Mantieni solo ultimi MAX_BACKUPS backup per questo giardino
            const gardenBackups = backups.filter((b)=>b.gardenId === garden.id);
            if (gardenBackups.length > MAX_BACKUPS) {
                // Rimuovi backup più vecchi per questo giardino
                gardenBackups.sort((a, b)=>new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const toRemove = gardenBackups.slice(0, gardenBackups.length - MAX_BACKUPS);
                toRemove.forEach((oldBackup)=>{
                    const index = backups.findIndex((b)=>b.id === oldBackup.id);
                    if (index !== -1) {
                        backups.splice(index, 1);
                    }
                });
            }
            // Salva in localStorage
            try {
                localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
            } catch (error) {
                // Se localStorage è pieno, rimuovi backup più vecchi
                if (error.name === 'QuotaExceededError') {
                    cleanOldBackups(MAX_BACKUPS / 2); // Riduci a metà
                    // Riprova
                    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
                } else {
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error('Error saving auto backup:', error);
    // Non bloccare operazioni principali se backup fallisce
    }
}
function getBackups() {
    try {
        const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (!stored) {
            return [];
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error reading backups:', error);
        return [];
    }
}
function getBackupMetadata() {
    const backups = getBackups();
    return backups.map(({ data, ...metadata })=>metadata);
}
function getBackup(backupId) {
    const backups = getBackups();
    return backups.find((b)=>b.id === backupId) || null;
}
async function restoreBackup(backupId, storage) {
    const backup = getBackup(backupId);
    if (!backup) {
        return {
            success: false,
            gardensRestored: 0,
            tasksRestored: 0,
            harvestsRestored: 0,
            seedsRestored: 0,
            errors: [
                'Backup non trovato'
            ]
        };
    }
    return await restoreFromExportData(backup.data, storage);
}
async function restoreFromExportData(exportData, storage) {
    const errors = [];
    let gardensRestored = 0;
    let tasksRestored = 0;
    let harvestsRestored = 0;
    let seedsRestored = 0;
    try {
        // Crea nuovo giardino (genera nuovo ID per evitare conflitti)
        const newGarden = {
            ...exportData.garden,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const restoredGarden = await storage.createGarden(newGarden);
        gardensRestored = 1;
        // Ripristina task
        for (const task of exportData.tasks || []){
            try {
                await storage.createTask({
                    ...task,
                    id: crypto.randomUUID(),
                    gardenId: restoredGarden.id
                });
                tasksRestored++;
            } catch (error) {
                errors.push(`Errore import task: ${error.message}`);
            }
        }
        // Ripristina raccolti
        for (const harvest of exportData.harvests || []){
            try {
                await storage.createHarvestLog({
                    ...harvest,
                    id: crypto.randomUUID()
                });
                harvestsRestored++;
            } catch (error) {
                errors.push(`Errore import harvest: ${error.message}`);
            }
        }
        // Ripristina semi
        for (const seed of exportData.seedInventory || []){
            try {
                await storage.createSeedPacket({
                    ...seed,
                    id: crypto.randomUUID(),
                    gardenId: restoredGarden.id
                });
                seedsRestored++;
            } catch (error) {
                errors.push(`Errore import seed: ${error.message}`);
            }
        }
        return {
            success: errors.length === 0,
            gardensRestored,
            tasksRestored,
            harvestsRestored,
            seedsRestored,
            errors: errors.length > 0 ? errors : undefined
        };
    } catch (error) {
        return {
            success: false,
            gardensRestored,
            tasksRestored,
            harvestsRestored,
            seedsRestored,
            errors: [
                error.message || 'Errore durante ripristino'
            ]
        };
    }
}
function cleanOldBackups(maxBackups = MAX_BACKUPS) {
    try {
        const backups = getBackups();
        // Raggruppa per gardenId
        const backupsByGarden = new Map();
        backups.forEach((backup)=>{
            if (!backupsByGarden.has(backup.gardenId)) {
                backupsByGarden.set(backup.gardenId, []);
            }
            backupsByGarden.get(backup.gardenId).push(backup);
        });
        // Per ogni giardino, mantieni solo ultimi maxBackups
        const cleanedBackups = [];
        backupsByGarden.forEach((gardenBackups, gardenId)=>{
            // Ordina per timestamp (più recente prima)
            gardenBackups.sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            // Mantieni solo ultimi maxBackups
            cleanedBackups.push(...gardenBackups.slice(0, maxBackups));
        });
        // Salva backup puliti
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(cleanedBackups));
    } catch (error) {
        console.error('Error cleaning old backups:', error);
    }
}
function getLastBackup(gardenId) {
    const backups = getBackups();
    const gardenBackups = backups.filter((b)=>b.gardenId === gardenId).sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return gardenBackups.length > 0 ? gardenBackups[0] : null;
}
function getLatestBackup() {
    const backups = getBackups();
    if (backups.length === 0) {
        return null;
    }
    backups.sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return backups[0];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/storage-local/LocalStorageProvider.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * LocalStorage Provider Implementation
 * Wraps existing localStorage operations in IStorageProvider interface
 */ __turbopack_context__.s([
    "LocalStorageProvider",
    ()=>LocalStorageProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/storageService.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/autoBackupService.ts [app-client] (ecmascript)");
;
;
class LocalStorageProvider {
    STORAGE_KEYS = {
        GARDENS: 'ortoGardens',
        TASKS: 'ortoTasks',
        DEVICES: 'ortoDevices',
        SEEDS: 'ortoSeedPackets',
        HARVESTS: 'ortHarvestLogs',
        PHOTOS: 'ortoPhotoLogs',
        CUSTOM_PLANS: 'ortoCustomPlans',
        AGRONOMISTS: 'ortoAgronomists',
        CONSULTATIONS: 'ortoConsultations',
        ADVICE: 'ortoAgronomistAdvice',
        SEEDLING_BATCHES: 'ortSeedlingBatches',
        ACCESSORIES: 'ortoAccessories',
        HYDROPONIC_READINGS: 'ortoHydroponicReadings',
        AQUAPONIC_READINGS: 'ortoAquaponicReadings',
        GARDEN_BEDS: 'ortoGardenBeds'
    };
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch  {
            return false;
        }
    }
    // Gardens
    async getGardens() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getGardens();
    }
    async getGarden(id) {
        const gardens = await this.getGardens();
        return gardens.find((g)=>g.id === id) || null;
    }
    async createGarden(garden) {
        const newGarden = {
            ...garden,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const gardens = await this.getGardens();
        gardens.push(newGarden);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveGardens(gardens);
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, newGarden.id).catch((err)=>console.error('Error saving auto backup after createGarden:', err));
        return newGarden;
    }
    async updateGarden(id, updates) {
        const gardens = await this.getGardens();
        const index = gardens.findIndex((g)=>g.id === id);
        if (index === -1) {
            throw new Error(`Garden with id ${id} not found`);
        }
        gardens[index] = {
            ...gardens[index],
            ...updates
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveGardens(gardens);
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, id).catch((err)=>console.error('Error saving auto backup after updateGarden:', err));
        return gardens[index];
    }
    async deleteGarden(id) {
        const gardens = await this.getGardens();
        const filtered = gardens.filter((g)=>g.id !== id);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveGardens(filtered);
    }
    // Tasks
    async getTasks(gardenId) {
        const tasks = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getTasks();
        if (gardenId) {
            return tasks.filter((t)=>t.gardenId === gardenId);
        }
        return tasks;
    }
    async getTask(id) {
        const tasks = await this.getTasks();
        return tasks.find((t)=>t.id === id) || null;
    }
    async createTask(task) {
        const newTask = {
            ...task,
            id: crypto.randomUUID()
        };
        const tasks = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getTasks();
        tasks.push(newTask);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveTasks(tasks);
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, task.gardenId).catch((err)=>console.error('Error saving auto backup after createTask:', err));
        return newTask;
    }
    async updateTask(id, updates) {
        const tasks = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getTasks();
        const index = tasks.findIndex((t)=>t.id === id);
        if (index === -1) {
            throw new Error(`Task with id ${id} not found`);
        }
        const task = tasks[index];
        tasks[index] = {
            ...task,
            ...updates
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveTasks(tasks);
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, task.gardenId).catch((err)=>console.error('Error saving auto backup after updateTask:', err));
        return tasks[index];
    }
    async deleteTask(id) {
        const tasks = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getTasks();
        const filtered = tasks.filter((t)=>t.id !== id);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveTasks(filtered);
    }
    // Smart Devices
    async getDevices(gardenId) {
        const devices = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getDevices();
        if (gardenId) {
            return devices.filter((d)=>d.gardenId === gardenId);
        }
        return devices;
    }
    async getDevice(id) {
        const devices = await this.getDevices();
        return devices.find((d)=>d.id === id) || null;
    }
    async createDevice(device) {
        const newDevice = {
            ...device,
            id: crypto.randomUUID(),
            lastUpdate: new Date().toISOString()
        };
        const devices = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getDevices();
        devices.push(newDevice);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveDevices(devices);
        return newDevice;
    }
    async updateDevice(id, updates) {
        const devices = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getDevices();
        const index = devices.findIndex((d)=>d.id === id);
        if (index === -1) {
            throw new Error(`Device with id ${id} not found`);
        }
        devices[index] = {
            ...devices[index],
            ...updates,
            lastUpdate: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveDevices(devices);
        return devices[index];
    }
    async deleteDevice(id) {
        const devices = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].getDevices();
        const filtered = devices.filter((d)=>d.id !== id);
        __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$storageService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageService"].saveDevices(filtered);
    }
    // Seed Inventory
    async getSeedPackets(gardenId) {
        const saved = localStorage.getItem(this.STORAGE_KEYS.SEEDS);
        if (!saved) return [];
        try {
            const packets = JSON.parse(saved);
            if (gardenId) {
                return packets.filter((p)=>p.gardenId === gardenId);
            }
            return packets;
        } catch  {
            return [];
        }
    }
    async getSeedPacket(id) {
        const packets = await this.getSeedPackets();
        return packets.find((p)=>p.id === id) || null;
    }
    async createSeedPacket(packet) {
        const newPacket = {
            ...packet,
            id: crypto.randomUUID()
        };
        const packets = await this.getSeedPackets();
        packets.push(newPacket);
        localStorage.setItem(this.STORAGE_KEYS.SEEDS, JSON.stringify(packets));
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, packet.gardenId).catch((err)=>console.error('Error saving auto backup after createSeedPacket:', err));
        return newPacket;
    }
    async updateSeedPacket(id, updates) {
        const packets = await this.getSeedPackets();
        const index = packets.findIndex((p)=>p.id === id);
        if (index === -1) {
            throw new Error(`Seed packet with id ${id} not found`);
        }
        packets[index] = {
            ...packets[index],
            ...updates
        };
        localStorage.setItem(this.STORAGE_KEYS.SEEDS, JSON.stringify(packets));
        return packets[index];
    }
    async deleteSeedPacket(id) {
        const packets = await this.getSeedPackets();
        const filtered = packets.filter((p)=>p.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.SEEDS, JSON.stringify(filtered));
    }
    // Harvest Logs
    async getHarvestLogs(gardenId) {
        const saved = localStorage.getItem(this.STORAGE_KEYS.HARVESTS);
        if (!saved) return [];
        try {
            const logs = JSON.parse(saved);
            if (gardenId) {
                // HarvestLogData doesn't have gardenId directly, but we can filter by taskId
                const tasks = await this.getTasks(gardenId);
                const taskIds = new Set(tasks.map((t)=>t.id));
                return logs.filter((log)=>{
                    // If log has taskId, check if it belongs to this garden
                    // Otherwise, include all (legacy data)
                    return !log.id || taskIds.has(log.id);
                });
            }
            return logs;
        } catch  {
            return [];
        }
    }
    async createHarvestLog(log) {
        const newLog = {
            ...log,
            id: crypto.randomUUID()
        };
        const logs = await this.getHarvestLogs();
        logs.push(newLog);
        localStorage.setItem(this.STORAGE_KEYS.HARVESTS, JSON.stringify(logs));
        // Trigger backup automatico (non bloccare se fallisce)
        // Per harvest logs, dobbiamo trovare il gardenId dal task associato
        // Per ora, facciamo backup di tutti i giardini
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this).catch((err)=>console.error('Error saving auto backup after createHarvestLog:', err));
        return newLog;
    }
    async updateHarvestLog(id, updates) {
        const logs = await this.getHarvestLogs();
        const index = logs.findIndex((l)=>l.id === id);
        if (index === -1) {
            throw new Error(`Harvest log with id ${id} not found`);
        }
        logs[index] = {
            ...logs[index],
            ...updates
        };
        localStorage.setItem(this.STORAGE_KEYS.HARVESTS, JSON.stringify(logs));
        return logs[index];
    }
    async deleteHarvestLog(id) {
        const logs = await this.getHarvestLogs();
        const filtered = logs.filter((l)=>l.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.HARVESTS, JSON.stringify(filtered));
    }
    // Seedling Batches
    async getSeedlingBatches(gardenId) {
        const saved = localStorage.getItem(this.STORAGE_KEYS.SEEDLING_BATCHES);
        if (!saved) return [];
        try {
            const batches = JSON.parse(saved);
            if (gardenId) {
                return batches.filter((b)=>b.gardenId === gardenId);
            }
            return batches;
        } catch  {
            return [];
        }
    }
    async getSeedlingBatch(id) {
        const batches = await this.getSeedlingBatches();
        return batches.find((b)=>b.id === id) || null;
    }
    async createSeedlingBatch(batch) {
        const newBatch = {
            ...batch,
            id: crypto.randomUUID()
        };
        const batches = await this.getSeedlingBatches();
        batches.push(newBatch);
        localStorage.setItem(this.STORAGE_KEYS.SEEDLING_BATCHES, JSON.stringify(batches));
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, batch.gardenId).catch((err)=>console.error('Error saving auto backup after createSeedlingBatch:', err));
        return newBatch;
    }
    async updateSeedlingBatch(id, updates) {
        const batches = await this.getSeedlingBatches();
        const index = batches.findIndex((b)=>b.id === id);
        if (index === -1) {
            throw new Error(`Seedling batch with id ${id} not found`);
        }
        const batch = batches[index];
        batches[index] = {
            ...batch,
            ...updates
        };
        localStorage.setItem(this.STORAGE_KEYS.SEEDLING_BATCHES, JSON.stringify(batches));
        // Trigger backup automatico (non bloccare se fallisce)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])(this, batch.gardenId).catch((err)=>console.error('Error saving auto backup after updateSeedlingBatch:', err));
        return batches[index];
    }
    async deleteSeedlingBatch(id) {
        const batches = await this.getSeedlingBatches();
        const filtered = batches.filter((b)=>b.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.SEEDLING_BATCHES, JSON.stringify(filtered));
    }
    // Custom Plans
    getCustomPlans() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_PLANS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveCustomPlans(plans) {
        localStorage.setItem(this.STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(plans));
    }
    async createCustomPlan(plan) {
        const newPlan = {
            ...plan,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const plans = this.getCustomPlans();
        plans.push(newPlan);
        this.saveCustomPlans(plans);
        return newPlan;
    }
    async getCustomPlan(id) {
        const plans = this.getCustomPlans();
        return plans.find((p)=>p.id === id) || null;
    }
    async getUserCustomPlans(userId, gardenId) {
        const plans = this.getCustomPlans();
        let filtered = plans.filter((p)=>p.userId === userId);
        if (gardenId) {
            filtered = filtered.filter((p)=>!p.gardenId || p.gardenId === gardenId);
        }
        return filtered;
    }
    async updateCustomPlan(id, updates) {
        const plans = this.getCustomPlans();
        const index = plans.findIndex((p)=>p.id === id);
        if (index === -1) {
            throw new Error(`Custom plan with id ${id} not found`);
        }
        plans[index] = {
            ...plans[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveCustomPlans(plans);
        return plans[index];
    }
    async deleteCustomPlan(id) {
        const plans = this.getCustomPlans();
        const filtered = plans.filter((p)=>p.id !== id);
        this.saveCustomPlans(filtered);
    }
    // Agronomists
    getAllAgronomists() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.AGRONOMISTS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveAgronomists(agronomists) {
        localStorage.setItem(this.STORAGE_KEYS.AGRONOMISTS, JSON.stringify(agronomists));
    }
    async createAgronomist(agronomist) {
        const newAgronomist = {
            ...agronomist,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const agronomists = this.getAllAgronomists();
        agronomists.push(newAgronomist);
        this.saveAgronomists(agronomists);
        return newAgronomist;
    }
    async getAgronomists(userId) {
        const agronomists = this.getAllAgronomists();
        return agronomists.filter((a)=>a.userId === userId);
    }
    async updateAgronomist(id, updates) {
        const agronomists = this.getAllAgronomists();
        const index = agronomists.findIndex((a)=>a.id === id);
        if (index === -1) {
            throw new Error(`Agronomist with id ${id} not found`);
        }
        agronomists[index] = {
            ...agronomists[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveAgronomists(agronomists);
        return agronomists[index];
    }
    async deleteAgronomist(id) {
        const agronomists = this.getAllAgronomists();
        const filtered = agronomists.filter((a)=>a.id !== id);
        this.saveAgronomists(filtered);
    }
    // Consultations
    getAllConsultations() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.CONSULTATIONS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveConsultations(consultations) {
        localStorage.setItem(this.STORAGE_KEYS.CONSULTATIONS, JSON.stringify(consultations));
    }
    async createConsultation(consultation) {
        const newConsultation = {
            ...consultation,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const consultations = this.getAllConsultations();
        consultations.push(newConsultation);
        this.saveConsultations(consultations);
        return newConsultation;
    }
    async getConsultations(userId, agronomistId) {
        const consultations = this.getAllConsultations();
        let filtered = consultations.filter((c)=>c.userId === userId);
        if (agronomistId) {
            filtered = filtered.filter((c)=>c.agronomistId === agronomistId);
        }
        return filtered;
    }
    // Advice
    getAdvice() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.ADVICE);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveAdvice(advice) {
        localStorage.setItem(this.STORAGE_KEYS.ADVICE, JSON.stringify(advice));
    }
    async createAdvice(advice) {
        const newAdvice = {
            ...advice,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const allAdvice = this.getAdvice();
        allAdvice.push(newAdvice);
        this.saveAdvice(allAdvice);
        return newAdvice;
    }
    async getAgronomistAdvice(taskId) {
        const allAdvice = this.getAdvice();
        return allAdvice.filter((a)=>a.taskId === taskId);
    }
    async updateAdvice(id, updates) {
        const allAdvice = this.getAdvice();
        const index = allAdvice.findIndex((a)=>a.id === id);
        if (index === -1) {
            throw new Error(`Advice with id ${id} not found`);
        }
        allAdvice[index] = {
            ...allAdvice[index],
            ...updates
        };
        this.saveAdvice(allAdvice);
        return allAdvice[index];
    }
    // Garden Accessories
    getAllAccessories() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.ACCESSORIES);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveAccessories(accessories) {
        localStorage.setItem(this.STORAGE_KEYS.ACCESSORIES, JSON.stringify(accessories));
    }
    async getAccessories(gardenId) {
        const allAccessories = this.getAllAccessories();
        if (gardenId) {
            return allAccessories.filter((a)=>a.gardenId === gardenId);
        }
        return allAccessories;
    }
    async getAccessory(id) {
        const allAccessories = this.getAllAccessories();
        return allAccessories.find((a)=>a.id === id) || null;
    }
    async createAccessory(accessory) {
        const newAccessory = {
            ...accessory,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const allAccessories = this.getAllAccessories();
        allAccessories.push(newAccessory);
        this.saveAccessories(allAccessories);
        return newAccessory;
    }
    async updateAccessory(id, updates) {
        const allAccessories = this.getAllAccessories();
        const index = allAccessories.findIndex((a)=>a.id === id);
        if (index === -1) {
            throw new Error(`Accessory with id ${id} not found`);
        }
        allAccessories[index] = {
            ...allAccessories[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveAccessories(allAccessories);
        return allAccessories[index];
    }
    async deleteAccessory(id) {
        const allAccessories = this.getAllAccessories();
        const filtered = allAccessories.filter((a)=>a.id !== id);
        this.saveAccessories(filtered);
    }
    // Hydroponic Readings
    getHydroponicReadings() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.HYDROPONIC_READINGS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveHydroponicReadings(readings) {
        localStorage.setItem(this.STORAGE_KEYS.HYDROPONIC_READINGS, JSON.stringify(readings));
    }
    async getHydroponicReadings(gardenId, limit) {
        const allReadings = this.getHydroponicReadings();
        const filtered = allReadings.filter((r)=>r.gardenId === gardenId).sort((a, b)=>new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
        return limit ? filtered.slice(0, limit) : filtered;
    }
    async createHydroponicReading(reading) {
        const newReading = {
            ...reading,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const allReadings = this.getHydroponicReadings();
        allReadings.push(newReading);
        this.saveHydroponicReadings(allReadings);
        return newReading;
    }
    // Aquaponic Readings
    getAquaponicReadings() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.AQUAPONIC_READINGS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveAquaponicReadings(readings) {
        localStorage.setItem(this.STORAGE_KEYS.AQUAPONIC_READINGS, JSON.stringify(readings));
    }
    async getAquaponicReadings(gardenId, limit) {
        const allReadings = this.getAquaponicReadings();
        const filtered = allReadings.filter((r)=>r.gardenId === gardenId).sort((a, b)=>new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
        return limit ? filtered.slice(0, limit) : filtered;
    }
    async createAquaponicReading(reading) {
        const newReading = {
            ...reading,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        const allReadings = this.getAquaponicReadings();
        allReadings.push(newReading);
        this.saveAquaponicReadings(allReadings);
        return newReading;
    }
    // Garden Beds
    getGardenBeds() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.GARDEN_BEDS);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch  {
            return [];
        }
    }
    saveGardenBeds(beds) {
        localStorage.setItem(this.STORAGE_KEYS.GARDEN_BEDS, JSON.stringify(beds));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$autoBackupService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAutoBackup"])();
    }
    async getGardenBeds(gardenId) {
        const allBeds = this.getGardenBeds();
        return allBeds.filter((b)=>b.gardenId === gardenId);
    }
    async getGardenBed(id) {
        const allBeds = this.getGardenBeds();
        return allBeds.find((b)=>b.id === id) || null;
    }
    async createGardenBed(bed) {
        const newBed = {
            ...bed,
            id: `bed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        // Calcola area automaticamente
        if (newBed.shape === 'Rectangle' && newBed.lengthCm && newBed.widthCm) {
            newBed.areaSqMeters = newBed.lengthCm * newBed.widthCm / 10000;
        } else if (newBed.shape === 'Circle' && newBed.diameterCm) {
            newBed.areaSqMeters = Math.PI * Math.pow(newBed.diameterCm / 2, 2) / 10000;
        }
        const allBeds = this.getGardenBeds();
        allBeds.push(newBed);
        this.saveGardenBeds(allBeds);
        return newBed;
    }
    async updateGardenBed(id, updates) {
        const allBeds = this.getGardenBeds();
        const index = allBeds.findIndex((b)=>b.id === id);
        if (index === -1) {
            throw new Error(`GardenBed with id ${id} not found`);
        }
        const updatedBed = {
            ...allBeds[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        // Ricalcola area se dimensioni sono cambiate
        if (updates.lengthCm !== undefined || updates.widthCm !== undefined || updates.diameterCm !== undefined) {
            if (updatedBed.shape === 'Rectangle' && updatedBed.lengthCm && updatedBed.widthCm) {
                updatedBed.areaSqMeters = updatedBed.lengthCm * updatedBed.widthCm / 10000;
            } else if (updatedBed.shape === 'Circle' && updatedBed.diameterCm) {
                updatedBed.areaSqMeters = Math.PI * Math.pow(updatedBed.diameterCm / 2, 2) / 10000;
            }
        }
        allBeds[index] = updatedBed;
        this.saveGardenBeds(allBeds);
        return updatedBed;
    }
    async deleteGardenBed(id) {
        const allBeds = this.getGardenBeds();
        const filtered = allBeds.filter((b)=>b.id !== id);
        this.saveGardenBeds(filtered);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/config/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Supabase client configuration
 * This will be used in Phase 2+ for cloud storage
 */ __turbopack_context__.s([
    "getSupabaseClient",
    ()=>getSupabaseClient,
    "isSupabaseAvailable",
    ()=>isSupabaseAvailable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-client] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("config/supabase.ts")}`;
    }
};
;
let supabaseClient = null;
const getSupabaseClient = ()=>{
    if (supabaseClient) {
        return supabaseClient;
    }
    // Support both Next.js and Vite environments
    const supabaseUrl = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_URL || __TURBOPACK__import$2e$meta__?.env?.VITE_SUPABASE_URL : "TURBOPACK unreachable";
    const supabaseAnonKey = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_ANON_KEY || __TURBOPACK__import$2e$meta__?.env?.VITE_SUPABASE_ANON_KEY : "TURBOPACK unreachable";
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials not configured. Running in local mode.');
        return null;
    }
    try {
        supabaseClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });
        return supabaseClient;
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return null;
    }
};
const isSupabaseAvailable = ()=>{
    return getSupabaseClient() !== null;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/storage-cloud/SupabaseStorageProvider.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Supabase Storage Provider Implementation
 * Implements IStorageProvider for cloud storage via Supabase
 */ __turbopack_context__.s([
    "SupabaseStorageProvider",
    ()=>SupabaseStorageProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/supabase.ts [app-client] (ecmascript)");
;
class SupabaseStorageProvider {
    client;
    constructor(){
        this.client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
    }
    isAvailable() {
        return this.client !== null;
    }
    ensureClient() {
        if (!this.client) {
            throw new Error('Supabase client not available. Check configuration.');
        }
        return this.client;
    }
    // Gardens
    async getGardens() {
        const client = this.ensureClient();
        const { data, error } = await client.from('gardens').select('*').order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return this.mapGardensFromDB(data || []);
    }
    async getGarden(id) {
        const client = this.ensureClient();
        const { data, error } = await client.from('gardens').select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return this.mapGardenFromDB(data);
    }
    async createGarden(garden) {
        const client = this.ensureClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const dbGarden = this.mapGardenToDB(garden);
        const { data, error } = await client.from('gardens').insert({
            ...dbGarden,
            user_id: user.id
        }).select().single();
        if (error) throw error;
        return this.mapGardenFromDB(data);
    }
    async updateGarden(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = this.mapGardenToDB(updates);
        const { data, error } = await client.from('gardens').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapGardenFromDB(data);
    }
    async deleteGarden(id) {
        const client = this.ensureClient();
        const { error } = await client.from('gardens').delete().eq('id', id);
        if (error) throw error;
    }
    // Tasks
    async getTasks(gardenId) {
        const client = this.ensureClient();
        let query = client.from('garden_tasks').select('*');
        if (gardenId) {
            query = query.eq('garden_id', gardenId);
        }
        const { data, error } = await query.order('date', {
            ascending: false
        });
        if (error) throw error;
        return this.mapTasksFromDB(data || []);
    }
    async getTask(id) {
        const client = this.ensureClient();
        const { data, error } = await client.from('garden_tasks').select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return this.mapTaskFromDB(data);
    }
    async createTask(task) {
        const client = this.ensureClient();
        const dbTask = this.mapTaskToDB(task);
        const { data, error } = await client.from('garden_tasks').insert(dbTask).select().single();
        if (error) throw error;
        return this.mapTaskFromDB(data);
    }
    async updateTask(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = this.mapTaskToDB(updates);
        const { data, error } = await client.from('garden_tasks').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapTaskFromDB(data);
    }
    async deleteTask(id) {
        const client = this.ensureClient();
        const { error } = await client.from('garden_tasks').delete().eq('id', id);
        if (error) throw error;
    }
    // Smart Devices (stored in localStorage for now, can be migrated later)
    async getDevices(gardenId) {
        // TODO: Implement Supabase table for devices
        // For now, fallback to localStorage
        const saved = localStorage.getItem('ortoDevices');
        if (!saved) return [];
        try {
            const devices = JSON.parse(saved);
            if (gardenId) {
                return devices.filter((d)=>d.gardenId === gardenId);
            }
            return devices;
        } catch  {
            return [];
        }
    }
    async getDevice(id) {
        const devices = await this.getDevices();
        return devices.find((d)=>d.id === id) || null;
    }
    async createDevice(device) {
        // TODO: Implement Supabase table for devices
        const newDevice = {
            ...device,
            id: crypto.randomUUID(),
            lastUpdate: new Date().toISOString()
        };
        const devices = await this.getDevices();
        devices.push(newDevice);
        localStorage.setItem('ortoDevices', JSON.stringify(devices));
        return newDevice;
    }
    async updateDevice(id, updates) {
        // TODO: Implement Supabase table for devices
        const devices = await this.getDevices();
        const index = devices.findIndex((d)=>d.id === id);
        if (index === -1) throw new Error(`Device with id ${id} not found`);
        devices[index] = {
            ...devices[index],
            ...updates,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('ortoDevices', JSON.stringify(devices));
        return devices[index];
    }
    async deleteDevice(id) {
        // TODO: Implement Supabase table for devices
        const devices = await this.getDevices();
        const filtered = devices.filter((d)=>d.id !== id);
        localStorage.setItem('ortoDevices', JSON.stringify(filtered));
    }
    // Seed Inventory
    async getSeedPackets(gardenId) {
        const client = this.ensureClient();
        let query = client.from('seed_inventory').select('*');
        if (gardenId) {
            query = query.eq('garden_id', gardenId);
        }
        const { data, error } = await query.order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return this.mapSeedPacketsFromDB(data || []);
    }
    async getSeedPacket(id) {
        const client = this.ensureClient();
        const { data, error } = await client.from('seed_inventory').select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return this.mapSeedPacketFromDB(data);
    }
    async createSeedPacket(packet) {
        const client = this.ensureClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const dbPacket = this.mapSeedPacketToDB(packet);
        const { data, error } = await client.from('seed_inventory').insert({
            ...dbPacket,
            user_id: user.id
        }).select().single();
        if (error) throw error;
        return this.mapSeedPacketFromDB(data);
    }
    async updateSeedPacket(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = this.mapSeedPacketToDB(updates);
        const { data, error } = await client.from('seed_inventory').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapSeedPacketFromDB(data);
    }
    async deleteSeedPacket(id) {
        const client = this.ensureClient();
        const { error } = await client.from('seed_inventory').delete().eq('id', id);
        if (error) throw error;
    }
    // Harvest Logs
    async getHarvestLogs(gardenId) {
        const client = this.ensureClient();
        let query = client.from('harvest_logs').select('*');
        if (gardenId) {
            query = query.eq('garden_id', gardenId);
        }
        const { data, error } = await query.order('harvest_date', {
            ascending: false
        });
        if (error) throw error;
        return this.mapHarvestLogsFromDB(data || []);
    }
    async createHarvestLog(log) {
        const client = this.ensureClient();
        const dbLog = this.mapHarvestLogToDB(log);
        const { data, error } = await client.from('harvest_logs').insert(dbLog).select().single();
        if (error) throw error;
        return this.mapHarvestLogFromDB(data);
    }
    async updateHarvestLog(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = this.mapHarvestLogToDB(updates);
        const { data, error } = await client.from('harvest_logs').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapHarvestLogFromDB(data);
    }
    async deleteHarvestLog(id) {
        const client = this.ensureClient();
        const { error } = await client.from('harvest_logs').delete().eq('id', id);
        if (error) throw error;
    }
    // Pro Features
    async uploadPhoto(file, taskId, gardenId) {
        const client = this.ensureClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${gardenId}/${taskId}/${Date.now()}.${fileExt}`;
        const { data, error } = await client.storage.from('plant-photos').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = client.storage.from('plant-photos').getPublicUrl(data.path);
        return publicUrl;
    }
    async getPhotoLogs(taskId) {
        const client = this.ensureClient();
        const { data, error } = await client.from('photo_logs').select('*').eq('task_id', taskId).order('photo_date', {
            ascending: true
        });
        if (error) throw error;
        return this.mapPhotoLogsFromDB(data || []);
    }
    async createPhotoLog(log) {
        const client = this.ensureClient();
        const dbLog = this.mapPhotoLogToDB(log);
        const { data, error } = await client.from('photo_logs').insert(dbLog).select().single();
        if (error) throw error;
        return this.mapPhotoLogFromDB(data);
    }
    // Mapper functions (DB <-> TypeScript)
    mapGardenFromDB(db) {
        return {
            id: db.id,
            name: db.name,
            coordinates: db.coordinates,
            sizeSqMeters: Number(db.size_sq_meters),
            soilType: db.soil_type,
            soilPh: db.soil_ph ? Number(db.soil_ph) : undefined,
            altitudeMeters: db.altitude_meters,
            delayFactorDays: db.delay_factor_days,
            sunExposure: db.sun_exposure,
            dailySunHours: db.daily_sun_hours,
            aspectDirection: db.aspect_direction,
            windProtection: db.wind_protection,
            hasCompostBin: db.has_compost_bin,
            isRaisedBed: db.is_raised_bed,
            vacationMode: db.vacation_mode,
            createdAt: db.created_at
        };
    }
    mapGardenToDB(garden) {
        const db = {};
        if (garden.name !== undefined) db.name = garden.name;
        if (garden.coordinates !== undefined) db.coordinates = garden.coordinates;
        if (garden.sizeSqMeters !== undefined) db.size_sq_meters = garden.sizeSqMeters;
        if (garden.soilType !== undefined) db.soil_type = garden.soilType;
        if (garden.soilPh !== undefined) db.soil_ph = garden.soilPh;
        if (garden.altitudeMeters !== undefined) db.altitude_meters = garden.altitudeMeters;
        if (garden.delayFactorDays !== undefined) db.delay_factor_days = garden.delayFactorDays;
        if (garden.sunExposure !== undefined) db.sun_exposure = garden.sunExposure;
        if (garden.dailySunHours !== undefined) db.daily_sun_hours = garden.dailySunHours;
        if (garden.aspectDirection !== undefined) db.aspect_direction = garden.aspectDirection;
        if (garden.windProtection !== undefined) db.wind_protection = garden.windProtection;
        if (garden.hasCompostBin !== undefined) db.has_compost_bin = garden.hasCompostBin;
        if (garden.isRaisedBed !== undefined) db.is_raised_bed = garden.isRaisedBed;
        if (garden.vacationMode !== undefined) db.vacation_mode = garden.vacationMode;
        return db;
    }
    mapGardensFromDB(dbArray) {
        return dbArray.map((db)=>this.mapGardenFromDB(db));
    }
    mapTaskFromDB(db) {
        return {
            id: db.id,
            gardenId: db.garden_id,
            plantName: db.plant_name,
            variety: db.variety,
            plantingMethod: db.planting_method,
            locationType: db.location_type,
            initialQuantity: db.initial_quantity,
            currentQuantity: db.current_quantity,
            taskType: db.task_type,
            stage: db.stage,
            lifecycleState: db.lifecycle_state,
            season: db.season,
            date: db.date,
            expectedTransplantDate: db.expected_transplant_date,
            moonPhase: db.moon_phase,
            completed: db.completed,
            notes: db.notes,
            nextDueDate: db.next_due_date,
            treatmentProductId: db.treatment_product_id,
            gridPosition: db.grid_position,
            gridRotation: db.grid_rotation,
            userResponses: db.user_responses,
            recordedBrix: db.recorded_brix ? Number(db.recorded_brix) : undefined,
            harvestReadyAnalysis: db.harvest_ready_analysis,
            harvestHistory: db.harvest_history,
            finalHarvest: db.final_harvest,
            strawberryData: db.strawberry_data,
            fruitTreeData: db.fruit_tree_data,
            aromaticData: db.aromatic_data,
            oliveData: db.olive_data,
            vineData: db.vine_data,
            images: db.images,
            lastPhotoDate: db.last_photo_date
        };
    }
    mapTaskToDB(task) {
        const db = {};
        if (task.gardenId !== undefined) db.garden_id = task.gardenId;
        if (task.plantName !== undefined) db.plant_name = task.plantName;
        if (task.variety !== undefined) db.variety = task.variety;
        if (task.plantingMethod !== undefined) db.planting_method = task.plantingMethod;
        if (task.locationType !== undefined) db.location_type = task.locationType;
        if (task.initialQuantity !== undefined) db.initial_quantity = task.initialQuantity;
        if (task.currentQuantity !== undefined) db.current_quantity = task.currentQuantity;
        if (task.taskType !== undefined) db.task_type = task.taskType;
        if (task.stage !== undefined) db.stage = task.stage;
        if (task.lifecycleState !== undefined) db.lifecycle_state = task.lifecycleState;
        if (task.season !== undefined) db.season = task.season;
        if (task.date !== undefined) db.date = task.date;
        if (task.expectedTransplantDate !== undefined) db.expected_transplant_date = task.expectedTransplantDate;
        if (task.moonPhase !== undefined) db.moon_phase = task.moonPhase;
        if (task.completed !== undefined) db.completed = task.completed;
        if (task.notes !== undefined) db.notes = task.notes;
        if (task.nextDueDate !== undefined) db.next_due_date = task.nextDueDate;
        if (task.treatmentProductId !== undefined) db.treatment_product_id = task.treatmentProductId;
        if (task.gridPosition !== undefined) db.grid_position = task.gridPosition;
        if (task.gridRotation !== undefined) db.grid_rotation = task.gridRotation;
        if (task.userResponses !== undefined) db.user_responses = task.userResponses;
        if (task.recordedBrix !== undefined) db.recorded_brix = task.recordedBrix;
        if (task.harvestReadyAnalysis !== undefined) db.harvest_ready_analysis = task.harvestReadyAnalysis;
        if (task.harvestHistory !== undefined) db.harvest_history = task.harvestHistory;
        if (task.finalHarvest !== undefined) db.final_harvest = task.finalHarvest;
        if (task.strawberryData !== undefined) db.strawberry_data = task.strawberryData;
        if (task.fruitTreeData !== undefined) db.fruit_tree_data = task.fruitTreeData;
        if (task.aromaticData !== undefined) db.aromatic_data = task.aromaticData;
        if (task.oliveData !== undefined) db.olive_data = task.oliveData;
        if (task.vineData !== undefined) db.vine_data = task.vineData;
        if (task.images !== undefined) db.images = task.images;
        if (task.lastPhotoDate !== undefined) db.last_photo_date = task.lastPhotoDate;
        return db;
    }
    mapTasksFromDB(dbArray) {
        return dbArray.map((db)=>this.mapTaskFromDB(db));
    }
    mapSeedPacketFromDB(db) {
        return {
            id: db.id,
            varietyId: db.variety_id,
            varietyName: db.variety_name,
            speciesName: db.species_name,
            purchaseDate: db.purchase_date,
            expiryYear: db.expiry_year,
            isOpen: db.is_open,
            quantityRemaining: db.quantity_remaining,
            notes: db.notes,
            gardenId: db.garden_id
        };
    }
    mapSeedPacketToDB(packet) {
        const db = {};
        if (packet.varietyId !== undefined) db.variety_id = packet.varietyId;
        if (packet.varietyName !== undefined) db.variety_name = packet.varietyName;
        if (packet.speciesName !== undefined) db.species_name = packet.speciesName;
        if (packet.purchaseDate !== undefined) db.purchase_date = packet.purchaseDate;
        if (packet.expiryYear !== undefined) db.expiry_year = packet.expiryYear;
        if (packet.isOpen !== undefined) db.is_open = packet.isOpen;
        if (packet.quantityRemaining !== undefined) db.quantity_remaining = packet.quantityRemaining;
        if (packet.notes !== undefined) db.notes = packet.notes;
        if (packet.gardenId !== undefined) db.garden_id = packet.gardenId;
        return db;
    }
    mapSeedPacketsFromDB(dbArray) {
        return dbArray.map((db)=>this.mapSeedPacketFromDB(db));
    }
    mapHarvestLogFromDB(db) {
        return {
            id: db.id,
            plantName: db.plant_name,
            gardenId: db.garden_id,
            taskId: db.task_id,
            quantity: Number(db.quantity),
            unit: db.unit,
            rating: db.rating,
            date: db.harvest_date,
            photo: db.photo,
            brix: db.brix ? Number(db.brix) : undefined,
            notes: db.notes,
            suggestedRecipes: db.suggested_recipes,
            strawberryHarvest: db.strawberry_harvest,
            fruitTreeHarvest: db.fruit_tree_harvest,
            aromaticHarvest: db.aromatic_harvest,
            oliveHarvest: db.olive_harvest,
            vineHarvest: db.vine_harvest
        };
    }
    mapHarvestLogToDB(log) {
        const db = {};
        if (log.plantName !== undefined) db.plant_name = log.plantName;
        if (log.gardenId !== undefined) db.garden_id = log.gardenId;
        if (log.taskId !== undefined) db.task_id = log.taskId;
        if (log.quantity !== undefined) db.quantity = log.quantity;
        if (log.unit !== undefined) db.unit = log.unit;
        if (log.rating !== undefined) db.rating = log.rating;
        if (log.date !== undefined) db.harvest_date = log.date;
        if (log.photo !== undefined) db.photo = log.photo;
        if (log.brix !== undefined) db.brix = log.brix;
        if (log.notes !== undefined) db.notes = log.notes;
        if (log.suggestedRecipes !== undefined) db.suggested_recipes = log.suggestedRecipes;
        if (log.strawberryHarvest !== undefined) db.strawberry_harvest = log.strawberryHarvest;
        if (log.fruitTreeHarvest !== undefined) db.fruit_tree_harvest = log.fruitTreeHarvest;
        if (log.aromaticHarvest !== undefined) db.aromatic_harvest = log.aromaticHarvest;
        if (log.oliveHarvest !== undefined) db.olive_harvest = log.oliveHarvest;
        if (log.vineHarvest !== undefined) db.vine_harvest = log.vineHarvest;
        return db;
    }
    mapHarvestLogsFromDB(dbArray) {
        return dbArray.map((db)=>this.mapHarvestLogFromDB(db));
    }
    mapPhotoLogFromDB(db) {
        return {
            id: db.id,
            taskId: db.task_id,
            gardenId: db.garden_id,
            photoUrl: db.photo_url,
            photoDate: db.photo_date,
            daysFromPlanting: db.days_from_planting,
            analysisResult: db.analysis_result,
            notes: db.notes,
            createdAt: db.created_at
        };
    }
    mapPhotoLogToDB(log) {
        const db = {};
        if (log.taskId !== undefined) db.task_id = log.taskId;
        if (log.gardenId !== undefined) db.garden_id = log.gardenId;
        if (log.photoUrl !== undefined) db.photo_url = log.photoUrl;
        if (log.photoDate !== undefined) db.photo_date = log.photoDate;
        if (log.daysFromPlanting !== undefined) db.days_from_planting = log.daysFromPlanting;
        if (log.analysisResult !== undefined) db.analysis_result = log.analysisResult;
        if (log.notes !== undefined) db.notes = log.notes;
        return db;
    }
    mapPhotoLogsFromDB(dbArray) {
        return dbArray.map((db)=>this.mapPhotoLogFromDB(db));
    }
    // Custom Plans
    async createCustomPlan(plan) {
        const client = this.ensureClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const dbPlan = {
            user_id: user.id,
            garden_id: plan.gardenId || null,
            name: plan.name,
            description: plan.description || null,
            base_master_sheet_id: plan.baseMasterSheetId,
            overrides: plan.overrides,
            custom_notes: plan.customNotes || [],
            custom_methods: plan.customMethods || [],
            additional_parameters: plan.additionalParameters || {},
            is_public: plan.isPublic || false
        };
        const { data, error } = await client.from('custom_plans').insert(dbPlan).select().single();
        if (error) throw error;
        return this.mapCustomPlanFromDB(data);
    }
    async getCustomPlan(id) {
        const client = this.ensureClient();
        const { data, error } = await client.from('custom_plans').select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return this.mapCustomPlanFromDB(data);
    }
    async getUserCustomPlans(userId, gardenId) {
        const client = this.ensureClient();
        let query = client.from('custom_plans').select('*').eq('user_id', userId).order('created_at', {
            ascending: false
        });
        if (gardenId) {
            query = query.or(`garden_id.is.null,garden_id.eq.${gardenId}`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((db)=>this.mapCustomPlanFromDB(db));
    }
    async updateCustomPlan(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.overrides !== undefined) dbUpdates.overrides = updates.overrides;
        if (updates.customNotes !== undefined) dbUpdates.custom_notes = updates.customNotes;
        if (updates.customMethods !== undefined) dbUpdates.custom_methods = updates.customMethods;
        if (updates.additionalParameters !== undefined) dbUpdates.additional_parameters = updates.additionalParameters;
        if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
        const { data, error } = await client.from('custom_plans').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapCustomPlanFromDB(data);
    }
    async deleteCustomPlan(id) {
        const client = this.ensureClient();
        const { error } = await client.from('custom_plans').delete().eq('id', id);
        if (error) throw error;
    }
    mapCustomPlanFromDB(db) {
        // This is a simplified mapping - CustomPlan extends PlantMasterSheet
        // In a real implementation, we'd need to fetch the base master sheet and merge
        return {
            id: db.id,
            baseMasterSheetId: db.base_master_sheet_id,
            userId: db.user_id,
            gardenId: db.garden_id,
            name: db.name,
            description: db.description,
            overrides: db.overrides || {},
            customNotes: db.custom_notes || [],
            customMethods: db.custom_methods || [],
            additionalParameters: db.additional_parameters || {},
            isPublic: db.is_public || false,
            createdAt: db.created_at,
            updatedAt: db.updated_at
        };
    }
    // Agronomists
    async createAgronomist(agronomist) {
        const client = this.ensureClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const dbAgronomist = {
            user_id: user.id,
            name: agronomist.name,
            email: agronomist.email || null,
            phone: agronomist.phone || null,
            specialization: agronomist.specialization || [],
            notes: agronomist.notes || null,
            preferred_contact_method: agronomist.preferredContactMethod,
            consultation_frequency: agronomist.consultationFrequency || null
        };
        const { data, error } = await client.from('agronomists').insert(dbAgronomist).select().single();
        if (error) throw error;
        return this.mapAgronomistFromDB(data);
    }
    async getAgronomists(userId) {
        const client = this.ensureClient();
        const { data, error } = await client.from('agronomists').select('*').eq('user_id', userId).order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((db)=>this.mapAgronomistFromDB(db));
    }
    async updateAgronomist(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.specialization !== undefined) dbUpdates.specialization = updates.specialization;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.preferredContactMethod !== undefined) dbUpdates.preferred_contact_method = updates.preferredContactMethod;
        if (updates.consultationFrequency !== undefined) dbUpdates.consultation_frequency = updates.consultationFrequency;
        const { data, error } = await client.from('agronomists').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapAgronomistFromDB(data);
    }
    async deleteAgronomist(id) {
        const client = this.ensureClient();
        const { error } = await client.from('agronomists').delete().eq('id', id);
        if (error) throw error;
    }
    mapAgronomistFromDB(db) {
        return {
            id: db.id,
            userId: db.user_id,
            name: db.name,
            email: db.email,
            phone: db.phone,
            specialization: db.specialization || [],
            notes: db.notes,
            preferredContactMethod: db.preferred_contact_method,
            consultationFrequency: db.consultation_frequency,
            createdAt: db.created_at,
            updatedAt: db.updated_at
        };
    }
    // Consultations
    async createConsultation(consultation) {
        const client = this.ensureClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        const dbConsultation = {
            agronomist_id: consultation.agronomistId,
            user_id: user.id,
            garden_id: consultation.gardenId || null,
            task_id: consultation.taskId || null,
            date: consultation.date,
            consultation_type: consultation.consultationType,
            topic: consultation.topic,
            advice: consultation.advice,
            notes: consultation.notes || null,
            attachments: consultation.attachments || []
        };
        const { data, error } = await client.from('agronomist_consultations').insert(dbConsultation).select().single();
        if (error) throw error;
        return this.mapConsultationFromDB(data);
    }
    async getConsultations(userId, agronomistId) {
        const client = this.ensureClient();
        let query = client.from('agronomist_consultations').select('*').eq('user_id', userId).order('date', {
            ascending: false
        });
        if (agronomistId) {
            query = query.eq('agronomist_id', agronomistId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((db)=>this.mapConsultationFromDB(db));
    }
    mapConsultationFromDB(db) {
        return {
            id: db.id,
            agronomistId: db.agronomist_id,
            userId: db.user_id,
            gardenId: db.garden_id,
            taskId: db.task_id,
            date: db.date,
            consultationType: db.consultation_type,
            topic: db.topic,
            advice: db.advice || [],
            notes: db.notes,
            attachments: db.attachments || [],
            createdAt: db.created_at
        };
    }
    // Advice
    async createAdvice(advice) {
        const client = this.ensureClient();
        const dbAdvice = {
            consultation_id: advice.consultationId,
            task_id: advice.taskId || null,
            advice_text: advice.adviceText,
            category: advice.category,
            priority: advice.priority,
            apply_date: advice.applyDate || null,
            apply_season: advice.applySeason || [],
            applied: advice.applied || false,
            applied_date: advice.appliedDate || null,
            result: advice.result || null
        };
        const { data, error } = await client.from('agronomist_advice').insert(dbAdvice).select().single();
        if (error) throw error;
        return this.mapAdviceFromDB(data);
    }
    async getAgronomistAdvice(taskId) {
        const client = this.ensureClient();
        const { data, error } = await client.from('agronomist_advice').select('*').eq('task_id', taskId).order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((db)=>this.mapAdviceFromDB(db));
    }
    async updateAdvice(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = {};
        if (updates.adviceText !== undefined) dbUpdates.advice_text = updates.adviceText;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.applyDate !== undefined) dbUpdates.apply_date = updates.applyDate;
        if (updates.applySeason !== undefined) dbUpdates.apply_season = updates.applySeason;
        if (updates.applied !== undefined) dbUpdates.applied = updates.applied;
        if (updates.appliedDate !== undefined) dbUpdates.applied_date = updates.appliedDate;
        if (updates.result !== undefined) dbUpdates.result = updates.result;
        const { data, error } = await client.from('agronomist_advice').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapAdviceFromDB(data);
    }
    mapAdviceFromDB(db) {
        return {
            id: db.id,
            consultationId: db.consultation_id,
            taskId: db.task_id,
            adviceText: db.advice_text,
            category: db.category,
            priority: db.priority,
            applyDate: db.apply_date,
            applySeason: db.apply_season || [],
            applied: db.applied || false,
            appliedDate: db.applied_date,
            result: db.result,
            createdAt: db.created_at
        };
    }
    // Garden Accessories
    async getAccessories(gardenId) {
        const client = this.ensureClient();
        let query = client.from('garden_accessories').select('*');
        if (gardenId) {
            query = query.eq('garden_id', gardenId);
        }
        const { data, error } = await query.order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((db)=>this.mapAccessoryFromDB(db));
    }
    async getAccessory(id) {
        const client = this.ensureClient();
        const { data, error } = await client.from('garden_accessories').select('*').eq('id', id).single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return this.mapAccessoryFromDB(data);
    }
    async createAccessory(accessory) {
        const client = this.ensureClient();
        const dbData = {
            garden_id: accessory.gardenId,
            name: accessory.name,
            category: accessory.category,
            material: accessory.material,
            quantity: accessory.quantity,
            length_cm: accessory.length,
            height_cm: accessory.height,
            width_cm: accessory.width,
            diameter_cm: accessory.diameter,
            mesh_size_mm: accessory.meshSize,
            used_for: accessory.usedFor,
            installation_date: accessory.installationDate,
            expected_lifespan_years: accessory.expectedLifespan,
            last_maintenance: accessory.lastMaintenance,
            needs_replacement: accessory.needsReplacement || false,
            position: accessory.position
        };
        if (accessory.supportType) dbData.support_type = accessory.supportType;
        if (accessory.nettingType) dbData.netting_type = accessory.nettingType;
        if (accessory.wireType) dbData.wire_type = accessory.wireType;
        const { data, error } = await client.from('garden_accessories').insert(dbData).select().single();
        if (error) throw error;
        return this.mapAccessoryFromDB(data);
    }
    async updateAccessory(id, updates) {
        const client = this.ensureClient();
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.supportType !== undefined) dbUpdates.support_type = updates.supportType;
        if (updates.nettingType !== undefined) dbUpdates.netting_type = updates.nettingType;
        if (updates.wireType !== undefined) dbUpdates.wire_type = updates.wireType;
        if (updates.material !== undefined) dbUpdates.material = updates.material;
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.length !== undefined) dbUpdates.length_cm = updates.length;
        if (updates.height !== undefined) dbUpdates.height_cm = updates.height;
        if (updates.width !== undefined) dbUpdates.width_cm = updates.width;
        if (updates.diameter !== undefined) dbUpdates.diameter_cm = updates.diameter;
        if (updates.meshSize !== undefined) dbUpdates.mesh_size_mm = updates.meshSize;
        if (updates.usedFor !== undefined) dbUpdates.used_for = updates.usedFor;
        if (updates.installationDate !== undefined) dbUpdates.installation_date = updates.installationDate;
        if (updates.expectedLifespan !== undefined) dbUpdates.expected_lifespan_years = updates.expectedLifespan;
        if (updates.lastMaintenance !== undefined) dbUpdates.last_maintenance = updates.lastMaintenance;
        if (updates.needsReplacement !== undefined) dbUpdates.needs_replacement = updates.needsReplacement;
        if (updates.position !== undefined) dbUpdates.position = updates.position;
        const { data, error } = await client.from('garden_accessories').update(dbUpdates).eq('id', id).select().single();
        if (error) throw error;
        return this.mapAccessoryFromDB(data);
    }
    async deleteAccessory(id) {
        const client = this.ensureClient();
        const { error } = await client.from('garden_accessories').delete().eq('id', id);
        if (error) throw error;
    }
    mapAccessoryFromDB(db) {
        return {
            id: db.id,
            gardenId: db.garden_id,
            name: db.name,
            category: db.category,
            supportType: db.support_type,
            nettingType: db.netting_type,
            wireType: db.wire_type,
            material: db.material,
            quantity: db.quantity,
            length: db.length_cm,
            height: db.height_cm,
            width: db.width_cm,
            diameter: db.diameter_cm,
            meshSize: db.mesh_size_mm,
            usedFor: db.used_for || [],
            installationDate: db.installation_date,
            expectedLifespan: db.expected_lifespan_years,
            lastMaintenance: db.last_maintenance,
            needsReplacement: db.needs_replacement || false,
            position: db.position,
            createdAt: db.created_at,
            updatedAt: db.updated_at
        };
    }
    // Hydroponic Readings
    async getHydroponicReadings(gardenId, limit) {
        const client = this.ensureClient();
        let query = client.from('hydroponic_readings').select('*').eq('garden_id', gardenId).order('reading_date', {
            ascending: false
        });
        if (limit) {
            query = query.limit(limit);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((db)=>this.mapHydroponicReadingFromDB(db));
    }
    async createHydroponicReading(reading) {
        const client = this.ensureClient();
        const dbData = {
            garden_id: reading.gardenId,
            reading_date: reading.readingDate,
            ph: reading.ph,
            ec: reading.ec,
            water_temperature: reading.waterTemperature,
            reservoir_volume: reading.reservoirVolume,
            notes: reading.notes
        };
        const { data, error } = await client.from('hydroponic_readings').insert(dbData).select().single();
        if (error) throw error;
        return this.mapHydroponicReadingFromDB(data);
    }
    mapHydroponicReadingFromDB(db) {
        return {
            id: db.id,
            gardenId: db.garden_id,
            readingDate: db.reading_date,
            ph: db.ph,
            ec: db.ec,
            waterTemperature: db.water_temperature,
            reservoirVolume: db.reservoir_volume,
            notes: db.notes,
            createdAt: db.created_at
        };
    }
    // Aquaponic Readings
    async getAquaponicReadings(gardenId, limit) {
        const client = this.ensureClient();
        let query = client.from('aquaponic_readings').select('*').eq('garden_id', gardenId).order('reading_date', {
            ascending: false
        });
        if (limit) {
            query = query.limit(limit);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((db)=>this.mapAquaponicReadingFromDB(db));
    }
    async createAquaponicReading(reading) {
        const client = this.ensureClient();
        const dbData = {
            garden_id: reading.gardenId,
            reading_date: reading.readingDate,
            ph: reading.ph,
            ammonia: reading.ammonia,
            nitrite: reading.nitrite,
            nitrate: reading.nitrate,
            water_temperature: reading.waterTemperature,
            dissolved_oxygen: reading.dissolvedOxygen,
            notes: reading.notes
        };
        const { data, error } = await client.from('aquaponic_readings').insert(dbData).select().single();
        if (error) throw error;
        return this.mapAquaponicReadingFromDB(data);
    }
    mapAquaponicReadingFromDB(db) {
        return {
            id: db.id,
            gardenId: db.garden_id,
            readingDate: db.reading_date,
            ph: db.ph,
            ammonia: db.ammonia,
            nitrite: db.nitrite,
            nitrate: db.nitrate,
            waterTemperature: db.water_temperature,
            dissolvedOxygen: db.dissolved_oxygen,
            notes: db.notes,
            createdAt: db.created_at
        };
    }
    // Garden Beds
    async getGardenBeds(gardenId) {
        const client = this.ensureClient();
        const { data, error } = await client.from('garden_beds').select('*').eq('garden_id', gardenId).order('created_at', {
            ascending: false
        });
        if (error) throw error;
        return (data || []).map((db)=>this.mapGardenBedFromDB(db));
    }
    async getGardenBed(id) {
        const client = this.ensureClient();
        const { data, error } = await client.from('garden_beds').eq('id', id).select().single();
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return this.mapGardenBedFromDB(data);
    }
    async createGardenBed(bed) {
        const client = this.ensureClient();
        // Calcola area automaticamente
        let areaSqMeters = bed.areaSqMeters;
        if (!areaSqMeters) {
            if (bed.shape === 'Rectangle' && bed.lengthCm && bed.widthCm) {
                areaSqMeters = bed.lengthCm * bed.widthCm / 10000;
            } else if (bed.shape === 'Circle' && bed.diameterCm) {
                areaSqMeters = Math.PI * Math.pow(bed.diameterCm / 2, 2) / 10000;
            }
        }
        const dbData = {
            garden_id: bed.gardenId,
            name: bed.name,
            bed_type: bed.bedType,
            shape: bed.shape,
            length_cm: bed.lengthCm,
            width_cm: bed.widthCm,
            diameter_cm: bed.diameterCm,
            size_sq_meters: areaSqMeters,
            position: bed.position,
            soil_type: bed.soilType,
            sun_exposure: bed.sunExposure,
            daily_sun_hours: bed.dailySunHours,
            structure_id: bed.structureId,
            structure_type: bed.structureType,
            is_covered: bed.isCovered || false,
            covering_structure_id: bed.coveringStructureId,
            notes: bed.notes
        };
        const { data, error } = await client.from('garden_beds').insert(dbData).select().single();
        if (error) throw error;
        return this.mapGardenBedFromDB(data);
    }
    async updateGardenBed(id, updates) {
        const client = this.ensureClient();
        // Ricalcola area se dimensioni sono cambiate
        let areaSqMeters = updates.areaSqMeters;
        if (updates.lengthCm !== undefined || updates.widthCm !== undefined || updates.diameterCm !== undefined) {
            const currentBed = await this.getGardenBed(id);
            if (currentBed) {
                const shape = updates.shape || currentBed.shape;
                const lengthCm = updates.lengthCm ?? currentBed.lengthCm;
                const widthCm = updates.widthCm ?? currentBed.widthCm;
                const diameterCm = updates.diameterCm ?? currentBed.diameterCm;
                if (shape === 'Rectangle' && lengthCm && widthCm) {
                    areaSqMeters = lengthCm * widthCm / 10000;
                } else if (shape === 'Circle' && diameterCm) {
                    areaSqMeters = Math.PI * Math.pow(diameterCm / 2, 2) / 10000;
                }
            }
        }
        const dbData = {};
        if (updates.name !== undefined) dbData.name = updates.name;
        if (updates.bedType !== undefined) dbData.bed_type = updates.bedType;
        if (updates.shape !== undefined) dbData.shape = updates.shape;
        if (updates.lengthCm !== undefined) dbData.length_cm = updates.lengthCm;
        if (updates.widthCm !== undefined) dbData.width_cm = updates.widthCm;
        if (updates.diameterCm !== undefined) dbData.diameter_cm = updates.diameterCm;
        if (areaSqMeters !== undefined) dbData.size_sq_meters = areaSqMeters;
        if (updates.position !== undefined) dbData.position = updates.position;
        if (updates.soilType !== undefined) dbData.soil_type = updates.soilType;
        if (updates.sunExposure !== undefined) dbData.sun_exposure = updates.sunExposure;
        if (updates.dailySunHours !== undefined) dbData.daily_sun_hours = updates.dailySunHours;
        if (updates.structureId !== undefined) dbData.structure_id = updates.structureId;
        if (updates.structureType !== undefined) dbData.structure_type = updates.structureType;
        if (updates.isCovered !== undefined) dbData.is_covered = updates.isCovered;
        if (updates.coveringStructureId !== undefined) dbData.covering_structure_id = updates.coveringStructureId;
        if (updates.notes !== undefined) dbData.notes = updates.notes;
        const { data, error } = await client.from('garden_beds').update(dbData).eq('id', id).select().single();
        if (error) throw error;
        return this.mapGardenBedFromDB(data);
    }
    async deleteGardenBed(id) {
        const client = this.ensureClient();
        const { error } = await client.from('garden_beds').delete().eq('id', id);
        if (error) throw error;
    }
    // Sync method (optional in interface)
    async sync() {
        // Per Supabase, la sincronizzazione è automatica (tutte le operazioni CRUD sono già sincronizzate)
        // Questo metodo può essere usato per forzare refresh o aggiornare timestamp
        const client = this.ensureClient();
        try {
            // Verifica connessione facendo una query leggera
            await client.from('gardens').select('id').limit(1);
        } catch (error) {
            // Se c'è un errore, lo rilanciamo per permettere gestione errori nel chiamante
            throw error;
        }
    }
    mapGardenBedFromDB(db) {
        return {
            id: db.id,
            gardenId: db.garden_id,
            name: db.name,
            bedType: db.bed_type,
            shape: db.shape,
            lengthCm: db.length_cm,
            widthCm: db.width_cm,
            diameterCm: db.diameter_cm,
            areaSqMeters: db.size_sq_meters,
            position: db.position,
            soilType: db.soil_type,
            sunExposure: db.sun_exposure,
            dailySunHours: db.daily_sun_hours,
            structureId: db.structure_id,
            structureType: db.structure_type,
            isCovered: db.is_covered || false,
            coveringStructureId: db.covering_structure_id,
            notes: db.notes,
            createdAt: db.created_at,
            updatedAt: db.updated_at
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/storage/factory.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Storage Provider Factory
 * Creates the appropriate storage provider based on tier and availability
 */ __turbopack_context__.s([
    "createStorageProvider",
    ()=>createStorageProvider,
    "getDefaultStorageProvider",
    ()=>getDefaultStorageProvider,
    "getLocalStorageProvider",
    ()=>getLocalStorageProvider,
    "getSupabaseStorageProvider",
    ()=>getSupabaseStorageProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$local$2f$LocalStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/storage-local/LocalStorageProvider.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$cloud$2f$SupabaseStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/storage-cloud/SupabaseStorageProvider.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/supabase.ts [app-client] (ecmascript)");
;
;
;
const createStorageProvider = (type = 'auto')=>{
    switch(type){
        case 'local':
            return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$local$2f$LocalStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocalStorageProvider"]();
        case 'cloud':
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseAvailable"])()) {
                console.warn('Supabase not available, falling back to localStorage');
                return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$local$2f$LocalStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocalStorageProvider"]();
            }
            return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$cloud$2f$SupabaseStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SupabaseStorageProvider"]();
        case 'auto':
        default:
            // Try Supabase first, fallback to localStorage
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseAvailable"])()) {
                return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$cloud$2f$SupabaseStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SupabaseStorageProvider"]();
            }
            return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$local$2f$LocalStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocalStorageProvider"]();
    }
};
const getDefaultStorageProvider = ()=>{
    return createStorageProvider('auto');
};
const getSupabaseStorageProvider = ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSupabaseAvailable"])()) {
        return null;
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$cloud$2f$SupabaseStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SupabaseStorageProvider"]();
};
const getLocalStorageProvider = ()=>{
    return new __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$storage$2d$local$2f$LocalStorageProvider$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocalStorageProvider"]();
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/context/StorageContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Storage Context Provider
 * Provides IStorageProvider to all components via React Context
 * Eliminates prop drilling of storageProvider
 * Switches automatically between LocalStorageProvider and SupabaseStorageProvider based on auth
 */ __turbopack_context__.s([
    "StorageProvider",
    ()=>StorageProvider,
    "useStorage",
    ()=>useStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/storage/factory.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
;
const StorageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const StorageProvider = ({ children, initialProvider })=>{
    _s();
    // Se initialProvider è fornito, usalo (per compatibilità)
    // Altrimenti usa switch automatico basato su auth
    const [storageProvider, setStorageProvider] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "StorageProvider.useState": ()=>initialProvider || (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultStorageProvider"])()
    }["StorageProvider.useState"]);
    const [isInitialized, setIsInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Verifica autenticazione Supabase direttamente (senza hook)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StorageProvider.useEffect": ()=>{
            if (initialProvider) {
                // Se initialProvider è fornito, non fare switch
                return;
            }
            const checkAuthAndSwitch = {
                "StorageProvider.useEffect.checkAuthAndSwitch": async ()=>{
                    try {
                        setIsInitialized(false);
                        // Verifica se c'è una sessione Supabase attiva
                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
                        let isAuthenticated = false;
                        if (supabase) {
                            const { data: { session } } = await supabase.auth.getSession();
                            isAuthenticated = !!session?.user;
                        }
                        if (isAuthenticated) {
                            // Utente autenticato: usa SupabaseStorageProvider
                            const supabaseProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseStorageProvider"])();
                            if (supabaseProvider) {
                                setStorageProvider(supabaseProvider);
                            } else {
                                // Fallback a LocalStorage se Supabase non disponibile
                                setStorageProvider((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalStorageProvider"])());
                            }
                        } else {
                            // Utente non autenticato: usa LocalStorageProvider
                            setStorageProvider((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalStorageProvider"])());
                        }
                        setIsInitialized(true);
                        setError(null);
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                        setError(errorMessage);
                        setIsInitialized(true);
                        console.error('Storage provider switch error:', err);
                        // Fallback a LocalStorage in caso di errore
                        setStorageProvider((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalStorageProvider"])());
                    }
                }
            }["StorageProvider.useEffect.checkAuthAndSwitch"];
            checkAuthAndSwitch();
            // Ascolta cambiamenti autenticazione
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (supabase) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange({
                    "StorageProvider.useEffect": async (event)=>{
                        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                            checkAuthAndSwitch();
                        }
                    }
                }["StorageProvider.useEffect"]);
                return ({
                    "StorageProvider.useEffect": ()=>{
                        subscription.unsubscribe();
                    }
                })["StorageProvider.useEffect"];
            }
        }
    }["StorageProvider.useEffect"], [
        initialProvider
    ]);
    // Optional: Test connection on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StorageProvider.useEffect": ()=>{
            const testConnection = {
                "StorageProvider.useEffect.testConnection": async ()=>{
                    try {
                        setIsInitialized(false);
                        // Test by getting gardens (lightweight operation)
                        await storageProvider.getGardens();
                        setIsInitialized(true);
                        setError(null);
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                        setError(errorMessage);
                        setIsInitialized(true); // Still initialized, just with error
                        console.error('Storage provider initialization error:', err);
                    }
                }
            }["StorageProvider.useEffect.testConnection"];
            testConnection();
        }
    }["StorageProvider.useEffect"], [
        storageProvider
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StorageContext.Provider, {
        value: {
            storageProvider,
            isInitialized,
            error
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/core/context/StorageContext.tsx",
        lineNumber: 122,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(StorageProvider, "TXYnKl0DHy10KviWhfvGaY0kX/w=");
_c = StorageProvider;
const useStorage = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(StorageContext);
    if (!context) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};
_s1(useStorage, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "StorageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/hooks/useAuth.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * useAuth Hook
 * Gestisce stato autenticazione e integrazione con Supabase Auth
 */ __turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Verifica sessione esistente al mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const checkSession = {
                "AuthProvider.useEffect.checkSession": async ()=>{
                    try {
                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
                        if (!supabase) {
                            setLoading(false);
                            return;
                        }
                        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                        if (sessionError) {
                            console.error('Session error:', sessionError);
                            setError(sessionError.message);
                        } else {
                            setUser(session?.user ?? null);
                        }
                    } catch (err) {
                        console.error('Error checking session:', err);
                        setError(err.message);
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthProvider.useEffect.checkSession"];
            checkSession();
            // Ascolta cambiamenti autenticazione
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (supabase) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange({
                    "AuthProvider.useEffect": async (event, session)=>{
                        setUser(session?.user ?? null);
                        setLoading(false);
                        if (event === 'SIGNED_OUT') {
                            setError(null);
                        }
                    }
                }["AuthProvider.useEffect"]);
                return ({
                    "AuthProvider.useEffect": ()=>{
                        subscription.unsubscribe();
                    }
                })["AuthProvider.useEffect"];
            }
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        setLoading(true);
        setError(null);
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (!supabase) {
                throw new Error('Supabase non configurato');
            }
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (authError) {
                throw authError;
            }
            setUser(data.user);
        } catch (err) {
            setError(err.message || 'Errore durante il login');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const logout = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (supabase) {
                await supabase.auth.signOut();
            }
            setUser(null);
        } catch (err) {
            setError(err.message || 'Errore durante il logout');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const register = async (email, password)=>{
        setLoading(true);
        setError(null);
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (!supabase) {
                throw new Error('Supabase non configurato');
            }
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/app`
                }
            });
            if (authError) {
                throw authError;
            }
            setUser(data.user ?? null);
        } catch (err) {
            setError(err.message || 'Errore durante la registrazione');
            throw err;
        } finally{
            setLoading(false);
        }
    };
    const refreshUser = async ()=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (err) {
            console.error('Error refreshing user:', err);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            error,
            login,
            logout,
            register,
            refreshUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/packages/core/hooks/useAuth.tsx",
        lineNumber: 165,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "PA9FxEY9xSNRrsSqaLtbYei52Hs=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/hooks/useTier.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * React Hook for Tier Management
 * Provides access to tier configuration and helper methods
 */ __turbopack_context__.s([
    "useTier",
    ()=>useTier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$TierContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/context/TierContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/config/tiers.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const useTier = ()=>{
    _s();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$TierContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TierContext"]);
    if (!context) {
        throw new Error('useTier must be used within a TierProvider');
    }
    const { tier, setTier, isConsumer: contextIsConsumer, isProfessional: contextIsProfessional } = context;
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierConfig"])(tier);
    const can = (feature)=>{
        // LOCALE: Bypassa controlli in sviluppo locale
        const isLocalDev = ("TURBOPACK compile-time value", "object") !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || ("TURBOPACK compile-time value", "development") === 'development');
        if ("TURBOPACK compile-time truthy", 1) {
            return true; // Permetti sempre accesso in locale
        }
        //TURBOPACK unreachable
        ;
    };
    const limit = (limitKey)=>{
        return config.limits[limitKey];
    };
    const checkLimit = (limitKey, currentValue)=>{
        // LOCALE: Bypassa limiti in sviluppo locale
        const isLocalDev = ("TURBOPACK compile-time value", "object") !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || ("TURBOPACK compile-time value", "development") === 'development');
        if ("TURBOPACK compile-time truthy", 1) {
            return {
                allowed: true,
                remaining: -1
            }; // Illimitato in locale
        }
        //TURBOPACK unreachable
        ;
        const maxValue = undefined;
        const remaining = undefined;
    };
    const hasFeature = (feature)=>{
        // LOCALE: Bypassa controlli in sviluppo locale
        const isLocalDev = ("TURBOPACK compile-time value", "object") !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || ("TURBOPACK compile-time value", "development") === 'development');
        if ("TURBOPACK compile-time truthy", 1) {
            return true; // Permetti sempre accesso in locale
        }
        //TURBOPACK unreachable
        ;
    };
    return {
        tier,
        config,
        isPro: tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO || tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO_CONSUMER || tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO_PROFESSIONAL,
        isFree: tier === __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].FREE,
        isConsumer: contextIsConsumer(),
        isProfessional: contextIsProfessional(),
        can,
        limit,
        checkLimit,
        hasFeature,
        setTier
    };
};
_s(useTier, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/consumer/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConsumerSidebar",
    ()=>ConsumerSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$basket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBasket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-basket.js [app-client] (ecmascript) <export default as ShoppingBasket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chef$2d$hat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChefHat$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chef-hat.js [app-client] (ecmascript) <export default as ChefHat>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book.js [app-client] (ecmascript) <export default as Book>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/hooks/useTier.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const menuItems = [
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        label: 'Dashboard',
        path: '/app',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
        label: 'Planner',
        path: '/app/planner',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"],
        label: 'Calendario',
        path: '/app/calendar',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
        label: 'Diario',
        path: '/app/journal',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$basket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBasket$3e$__["ShoppingBasket"],
        label: 'Raccolto',
        path: '/app/harvest',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
        label: 'Cura',
        path: '/app/advice',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
        label: 'Challenge',
        path: '/app/challenges',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chef$2d$hat$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChefHat$3e$__["ChefHat"],
        label: 'Ricette',
        path: '/app/recipes',
        tier: 'PRO_CONSUMER',
        badge: 'PRO'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Book$3e$__["Book"],
        label: 'Guide',
        path: '/app/guides',
        tier: 'PRO_CONSUMER',
        badge: 'PRO'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
        label: 'Aiuto',
        path: '/app/help',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        label: 'Settings',
        path: '/app/settings',
        tier: 'all'
    }
];
function ConsumerSidebar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { tier, can } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "w-64 bg-white border-r border-gray-200 min-h-screen p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-xl font-bold text-green-900",
                    children: "🌱 OrtoMio"
                }, void 0, false, {
                    fileName: "[project]/components/consumer/Sidebar.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/consumer/Sidebar.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "space-y-2",
                children: menuItems.map((item)=>{
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    const isAvailable = item.tier === 'all' || item.tier === 'PRO_CONSUMER' && (tier === 'PRO_CONSUMER' || tier === 'PRO');
                    if (!isAvailable) return null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.path,
                        className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-900 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/components/consumer/Sidebar.tsx",
                                lineNumber: 64,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/components/consumer/Sidebar.tsx",
                                lineNumber: 65,
                                columnNumber: 15
                            }, this),
                            item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded",
                                children: item.badge
                            }, void 0, false, {
                                fileName: "[project]/components/consumer/Sidebar.tsx",
                                lineNumber: 67,
                                columnNumber: 17
                            }, this)
                        ]
                    }, item.path, true, {
                        fileName: "[project]/components/consumer/Sidebar.tsx",
                        lineNumber: 55,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/consumer/Sidebar.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/consumer/Sidebar.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(ConsumerSidebar, "8AENqf0h56UQVnT3WRyh1lc4KHQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"]
    ];
});
_c = ConsumerSidebar;
var _c;
__turbopack_context__.k.register(_c, "ConsumerSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/professional/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfessionalSidebar",
    ()=>ProfessionalSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$basket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBasket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-basket.js [app-client] (ecmascript) <export default as ShoppingBasket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.js [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tractor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tractor$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/tractor.js [app-client] (ecmascript) <export default as Tractor>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/hooks/useTier.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const menuItems = [
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        label: 'Dashboard',
        path: '/app',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
        label: 'Planner',
        path: '/app/planner',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"],
        label: 'Calendario',
        path: '/app/calendar',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
        label: 'Diario',
        path: '/app/journal',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$basket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBasket$3e$__["ShoppingBasket"],
        label: 'Raccolto',
        path: '/app/harvest',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
        label: 'Cura',
        path: '/app/advice',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
        label: 'Challenge',
        path: '/app/challenges',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
        label: 'Analytics',
        path: '/app/analytics',
        tier: 'PRO_PROFESSIONAL',
        badge: 'PRO'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"],
        label: 'Trattamenti',
        path: '/app/treatments',
        tier: 'PRO_PROFESSIONAL',
        badge: 'PRO'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$tractor$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Tractor$3e$__["Tractor"],
        label: 'Lavorazioni',
        path: '/app/mechanical-work',
        tier: 'PRO_PROFESSIONAL',
        badge: 'PRO'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"],
        label: 'Export',
        path: '/app/export',
        tier: 'PRO_PROFESSIONAL',
        badge: 'PRO'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"],
        label: 'Smart Hub',
        path: '/app/smart',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
        label: 'Aiuto',
        path: '/app/help',
        tier: 'all'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        label: 'Settings',
        path: '/app/settings',
        tier: 'all'
    }
];
function ProfessionalSidebar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { tier } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "w-64 bg-white border-r border-gray-200 min-h-screen p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-gray-900",
                        children: "🌱 OrtoMio"
                    }, void 0, false, {
                        fileName: "[project]/components/professional/Sidebar.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500 mt-1",
                        children: "PRO Professional"
                    }, void 0, false, {
                        fileName: "[project]/components/professional/Sidebar.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/professional/Sidebar.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "space-y-2",
                children: menuItems.map((item)=>{
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    const isAvailable = item.tier === 'all' || item.tier === 'PRO_PROFESSIONAL' && tier === 'PRO_PROFESSIONAL';
                    if (!isAvailable) return null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.path,
                        className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/components/professional/Sidebar.tsx",
                                lineNumber: 72,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/components/professional/Sidebar.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this),
                            item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-auto text-xs bg-gray-600 text-white px-2 py-0.5 rounded",
                                children: item.badge
                            }, void 0, false, {
                                fileName: "[project]/components/professional/Sidebar.tsx",
                                lineNumber: 75,
                                columnNumber: 17
                            }, this)
                        ]
                    }, item.path, true, {
                        fileName: "[project]/components/professional/Sidebar.tsx",
                        lineNumber: 63,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/professional/Sidebar.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/professional/Sidebar.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(ProfessionalSidebar, "e64u+bwvjryDzkLzzlRm//BPiwI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"]
    ];
});
_c = ProfessionalSidebar;
var _c;
__turbopack_context__.k.register(_c, "ProfessionalSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/shared/FreeSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FreeSidebar",
    ()=>FreeSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-client] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$basket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBasket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-basket.js [app-client] (ecmascript) <export default as ShoppingBasket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.js [app-client] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-client] (ecmascript) <export default as HelpCircle>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const menuItems = [
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
        label: 'Dashboard',
        path: '/app'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
        label: 'Planner',
        path: '/app/planner'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"],
        label: 'Calendario',
        path: '/app/calendar'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
        label: 'Diario',
        path: '/app/journal'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$basket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingBasket$3e$__["ShoppingBasket"],
        label: 'Raccolto',
        path: '/app/harvest'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
        label: 'Cura',
        path: '/app/advice'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"],
        label: 'Challenge',
        path: '/app/challenges'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
        label: 'Aiuto',
        path: '/app/help'
    },
    {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
        label: 'Settings',
        path: '/app/settings'
    }
];
function FreeSidebar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "w-64 bg-white border-r border-gray-200 min-h-screen p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold text-green-900",
                        children: "🌱 OrtoMio"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/FreeSidebar.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500 mt-1",
                        children: "FREE"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/FreeSidebar.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/shared/FreeSidebar.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "space-y-2",
                children: menuItems.map((item)=>{
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.path,
                        className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-green-100 text-green-900 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                size: 20
                            }, void 0, false, {
                                fileName: "[project]/components/shared/FreeSidebar.tsx",
                                lineNumber: 56,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/components/shared/FreeSidebar.tsx",
                                lineNumber: 57,
                                columnNumber: 15
                            }, this)
                        ]
                    }, item.path, true, {
                        fileName: "[project]/components/shared/FreeSidebar.tsx",
                        lineNumber: 47,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/shared/FreeSidebar.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8 p-4 bg-green-50 rounded-lg border border-green-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-green-900 font-medium mb-2",
                        children: "Upgrade a PRO"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/FreeSidebar.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-green-700 mb-3",
                        children: "Sblocca tutte le feature avanzate"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/FreeSidebar.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/pricing",
                        className: "block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium",
                        children: "Vedi Piani"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/FreeSidebar.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/shared/FreeSidebar.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/shared/FreeSidebar.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(FreeSidebar, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = FreeSidebar;
var _c;
__turbopack_context__.k.register(_c, "FreeSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/packages/core/hooks/useStorage.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Re-export useStorage hook from StorageContext
 * This provides a cleaner import path: useStorage from '@/packages/core/hooks/useStorage'
 */ __turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/context/StorageContext.tsx [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/globalSearchService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Global Search Service
 * Provides unified search across multiple data types (tasks, harvests, seeds, gardens, etc.)
 */ __turbopack_context__.s([
    "searchAll",
    ()=>searchAll
]);
async function searchAll(query, storageProvider) {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    const userId = 'current-user-id'; // TODO: Get from auth context
    try {
        // Search in Tasks
        const tasks = await storageProvider.getGardenTasks(userId);
        tasks.forEach((task)=>{
            const relevance = calculateRelevance(searchTerm, [
                task.plantName,
                task.variety,
                task.notes,
                task.taskType
            ]);
            if (relevance > 0) {
                results.push({
                    type: 'task',
                    id: task.id,
                    title: `${task.taskType}: ${task.plantName || 'Task'}`,
                    description: task.notes || task.taskType,
                    date: task.date,
                    plantName: task.plantName,
                    relevanceScore: relevance
                });
            }
        });
        // Search in Harvest Logs
        const harvests = await storageProvider.getHarvestLogs(userId);
        harvests.forEach((harvest)=>{
            const relevance = calculateRelevance(searchTerm, [
                harvest.plantName,
                harvest.notes,
                harvest.variety
            ]);
            if (relevance > 0) {
                results.push({
                    type: 'harvest',
                    id: harvest.id,
                    title: `Raccolto: ${harvest.plantName || 'Raccolto'}`,
                    description: harvest.notes || `Quantità: ${harvest.quantity} ${harvest.unit}`,
                    date: harvest.date,
                    plantName: harvest.plantName,
                    relevanceScore: relevance
                });
            }
        });
        // Search in Seed Inventory
        const seeds = await storageProvider.getSeedInventory(userId);
        seeds.forEach((seed)=>{
            const relevance = calculateRelevance(searchTerm, [
                seed.plantName,
                seed.variety,
                seed.brand,
                seed.notes
            ]);
            if (relevance > 0) {
                results.push({
                    type: 'seed',
                    id: seed.id,
                    title: `Seme: ${seed.plantName || 'Seme'}`,
                    description: `${seed.variety || ''} ${seed.brand || ''}`.trim() || seed.notes || '',
                    plantName: seed.plantName,
                    relevanceScore: relevance
                });
            }
        });
        // Search in Gardens
        const gardens = await storageProvider.getGardens(userId);
        gardens.forEach((garden)=>{
            const relevance = calculateRelevance(searchTerm, [
                garden.name,
                garden.notes
            ]);
            if (relevance > 0) {
                results.push({
                    type: 'garden',
                    id: garden.id,
                    title: `Orto: ${garden.name}`,
                    description: garden.notes || `Dimensione: ${garden.area} m²`,
                    relevanceScore: relevance
                });
            }
        });
        // Search in Treatments (if available)
        try {
            const treatments = await storageProvider.getTreatments?.(userId);
            if (treatments) {
                treatments.forEach((treatment)=>{
                    const relevance = calculateRelevance(searchTerm, [
                        treatment.plantName,
                        treatment.product,
                        treatment.notes
                    ]);
                    if (relevance > 0) {
                        results.push({
                            type: 'treatment',
                            id: treatment.id,
                            title: `Trattamento: ${treatment.plantName || 'Trattamento'}`,
                            description: treatment.product || treatment.notes || '',
                            date: treatment.date,
                            plantName: treatment.plantName,
                            relevanceScore: relevance
                        });
                    }
                });
            }
        } catch (e) {
        // Treatments might not be available
        }
        // Search in Mechanical Work (if available)
        try {
            const mechanicalWork = await storageProvider.getMechanicalWork?.(userId);
            if (mechanicalWork) {
                mechanicalWork.forEach((work)=>{
                    const relevance = calculateRelevance(searchTerm, [
                        work.workType,
                        work.notes
                    ]);
                    if (relevance > 0) {
                        results.push({
                            type: 'mechanical',
                            id: work.id,
                            title: `Lavorazione: ${work.workType || 'Lavorazione'}`,
                            description: work.notes || work.workType,
                            date: work.date,
                            relevanceScore: relevance
                        });
                    }
                });
            }
        } catch (e) {
        // Mechanical work might not be available
        }
        // Sort by relevance score (descending)
        return results.sort((a, b)=>b.relevanceScore - a.relevanceScore);
    } catch (error) {
        console.error('Error in global search:', error);
        return [];
    }
}
/**
 * Calculate relevance score for a search term against multiple fields
 * @param searchTerm - Lowercase search term
 * @param fields - Array of fields to search in
 * @returns Relevance score (0-100)
 */ function calculateRelevance(searchTerm, fields) {
    let score = 0;
    const words = searchTerm.split(/\s+/).filter((w)=>w.length > 0);
    fields.forEach((field)=>{
        if (!field) return;
        const fieldLower = field.toLowerCase();
        words.forEach((word)=>{
            if (fieldLower === word) {
                score += 50; // Exact match
            } else if (fieldLower.startsWith(word)) {
                score += 30; // Starts with
            } else if (fieldLower.includes(word)) {
                score += 10; // Contains
            }
        });
    });
    return Math.min(score, 100);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/shared/GlobalSearch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Global Search Component
 * Provides a search bar with real-time results dropdown
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sprout$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sprout$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sprout.js [app-client] (ecmascript) <export default as Sprout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplet.js [app-client] (ecmascript) <export default as Droplet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useStorage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/hooks/useStorage.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/context/StorageContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$globalSearchService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/globalSearchService.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const GlobalSearch = ()=>{
    _s();
    const { storageProvider } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStorage"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showResults, setShowResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const searchTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Debounced search
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GlobalSearch.useEffect": ()=>{
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (query.trim().length < 2) {
                setResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout({
                "GlobalSearch.useEffect": async ()=>{
                    try {
                        const searchResults = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$globalSearchService$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["searchAll"])(query, storageProvider);
                        setResults(searchResults);
                    } catch (error) {
                        console.error('Search error:', error);
                        setResults([]);
                    } finally{
                        setIsSearching(false);
                    }
                }
            }["GlobalSearch.useEffect"], 300);
            return ({
                "GlobalSearch.useEffect": ()=>{
                    if (searchTimeoutRef.current) {
                        clearTimeout(searchTimeoutRef.current);
                    }
                }
            })["GlobalSearch.useEffect"];
        }
    }["GlobalSearch.useEffect"], [
        query,
        storageProvider
    ]);
    // Close dropdown when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GlobalSearch.useEffect": ()=>{
            const handleClickOutside = {
                "GlobalSearch.useEffect.handleClickOutside": (event)=>{
                    if (containerRef.current && !containerRef.current.contains(event.target)) {
                        setShowResults(false);
                    }
                }
            }["GlobalSearch.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "GlobalSearch.useEffect": ()=>document.removeEventListener('mousedown', handleClickOutside)
            })["GlobalSearch.useEffect"];
        }
    }["GlobalSearch.useEffect"], []);
    const handleResultClick = (result)=>{
        setShowResults(false);
        setQuery('');
        // Navigate based on result type
        switch(result.type){
            case 'task':
                router.push(`/app/journal`);
                break;
            case 'harvest':
                router.push(`/app/harvest`);
                break;
            case 'seed':
                router.push(`/app/seeds`);
                break;
            case 'garden':
                router.push(`/app/gardens`);
                break;
            case 'treatment':
                router.push(`/app/advice`);
                break;
            case 'mechanical':
                router.push(`/app/mechanical-work`);
                break;
            default:
                router.push(`/app/search?q=${encodeURIComponent(query)}`);
        }
    };
    const handleSearchSubmit = (e)=>{
        e.preventDefault();
        if (query.trim()) {
            router.push(`/app/search?q=${encodeURIComponent(query)}`);
            setShowResults(false);
        }
    };
    const getTypeIcon = (type)=>{
        switch(type){
            case 'task':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                    size: 16,
                    className: "text-blue-600"
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 108,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            case 'harvest':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                    size: 16,
                    className: "text-green-600"
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 110,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            case 'seed':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sprout$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sprout$3e$__["Sprout"], {
                    size: 16,
                    className: "text-yellow-600"
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 112,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            case 'garden':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                    size: 16,
                    className: "text-purple-600"
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 114,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            case 'treatment':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplet$3e$__["Droplet"], {
                    size: 16,
                    className: "text-red-600"
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 116,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            case 'mechanical':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                    size: 16,
                    className: "text-gray-600"
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 118,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                    size: 16
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 120,
                    columnNumber: 16
                }, ("TURBOPACK compile-time value", void 0));
        }
    };
    const getTypeLabel = (type)=>{
        switch(type){
            case 'task':
                return 'Task';
            case 'harvest':
                return 'Raccolto';
            case 'seed':
                return 'Seme';
            case 'garden':
                return 'Orto';
            case 'treatment':
                return 'Trattamento';
            case 'mechanical':
                return 'Lavorazione';
            default:
                return type;
        }
    };
    const groupedResults = results.reduce((acc, result)=>{
        if (!acc[result.type]) {
            acc[result.type] = [];
        }
        acc[result.type].push(result);
        return acc;
    }, {});
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "relative w-full max-w-md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSearchSubmit,
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: query,
                        onChange: (e)=>{
                            setQuery(e.target.value);
                            setShowResults(true);
                        },
                        onFocus: ()=>setShowResults(true),
                        placeholder: "Cerca in task, raccolti, semi...",
                        className: "w-full px-4 py-2 pl-10 pr-10 rounded-xl border border-green-200 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                        size: 18,
                        className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    query && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>{
                            setQuery('');
                            setResults([]);
                            setShowResults(false);
                        },
                        className: "absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            size: 16,
                            className: "text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/components/shared/GlobalSearch.tsx",
                            lineNumber: 179,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                        lineNumber: 170,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/shared/GlobalSearch.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            showResults && query.trim().length >= 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50",
                children: isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        size: 24,
                        className: "animate-spin text-green-600"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                        lineNumber: 189,
                        columnNumber: 15
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 188,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)) : results.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-2",
                    children: [
                        Object.entries(groupedResults).map(([type, typeResults])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        className: "px-3 py-2 text-xs font-bold text-gray-500 uppercase",
                                        children: [
                                            getTypeLabel(type),
                                            " (",
                                            typeResults.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                                        lineNumber: 195,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: typeResults.slice(0, 5).map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleResultClick(result),
                                                className: "w-full text-left px-3 py-2 hover:bg-green-50 rounded-lg transition-colors flex items-start gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-0.5",
                                                        children: getTypeIcon(result.type)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                                                        lineNumber: 205,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-semibold text-sm text-gray-900 truncate",
                                                                children: result.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/shared/GlobalSearch.tsx",
                                                                lineNumber: 207,
                                                                columnNumber: 27
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            result.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-gray-600 truncate mt-0.5",
                                                                children: result.description
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/shared/GlobalSearch.tsx",
                                                                lineNumber: 211,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            result.date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-gray-400 mt-0.5",
                                                                children: new Date(result.date).toLocaleDateString('it-IT')
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/shared/GlobalSearch.tsx",
                                                                lineNumber: 216,
                                                                columnNumber: 29
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                                                        lineNumber: 206,
                                                        columnNumber: 25
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, result.id, true, {
                                                fileName: "[project]/components/shared/GlobalSearch.tsx",
                                                lineNumber: 200,
                                                columnNumber: 23
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                                        lineNumber: 198,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, type, true, {
                                fileName: "[project]/components/shared/GlobalSearch.tsx",
                                lineNumber: 194,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))),
                        results.length > 10 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSearchSubmit,
                            className: "w-full mt-2 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg transition-colors",
                            children: [
                                "Vedi tutti i risultati (",
                                results.length,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/shared/GlobalSearch.tsx",
                            lineNumber: 227,
                            columnNumber: 17
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 192,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 text-center text-gray-500",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: "Nessun risultato trovato"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/GlobalSearch.tsx",
                        lineNumber: 237,
                        columnNumber: 15
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/shared/GlobalSearch.tsx",
                    lineNumber: 236,
                    columnNumber: 13
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/shared/GlobalSearch.tsx",
                lineNumber: 186,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/shared/GlobalSearch.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(GlobalSearch, "s76py49ZUxdlK/hGStMX7Rhf2HA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStorage"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = GlobalSearch;
const __TURBOPACK__default__export__ = GlobalSearch;
var _c;
__turbopack_context__.k.register(_c, "GlobalSearch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/shared/AuthStatus.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-in.js [app-client] (ecmascript) <export default as LogIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi.js [app-client] (ecmascript) <export default as Wifi>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wifi-off.js [app-client] (ecmascript) <export default as WifiOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function AuthStatus() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showMenu, setShowMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loggingOut, setLoggingOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthStatus.useEffect": ()=>{
            const checkAuth = {
                "AuthStatus.useEffect.checkAuth": async ()=>{
                    try {
                        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
                        if (!supabase) {
                            setLoading(false);
                            return;
                        }
                        const { data: { session } } = await supabase.auth.getSession();
                        setUser(session?.user ?? null);
                    } catch (error) {
                        console.error('Error checking auth:', error);
                    } finally{
                        setLoading(false);
                    }
                }
            }["AuthStatus.useEffect.checkAuth"];
            checkAuth();
            // Ascolta cambiamenti autenticazione
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (supabase) {
                const { data: { subscription } } = supabase.auth.onAuthStateChange({
                    "AuthStatus.useEffect": (event, session)=>{
                        setUser(session?.user ?? null);
                    }
                }["AuthStatus.useEffect"]);
                return ({
                    "AuthStatus.useEffect": ()=>{
                        subscription.unsubscribe();
                    }
                })["AuthStatus.useEffect"];
            }
        }
    }["AuthStatus.useEffect"], []);
    const handleLogout = async ()=>{
        setLoggingOut(true);
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
            if (supabase) {
                await supabase.auth.signOut();
            }
            setUser(null);
            router.push('/app');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        } finally{
            setLoggingOut(false);
            setShowMenu(false);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 px-3 py-2",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                size: 16,
                className: "animate-spin text-gray-400"
            }, void 0, false, {
                fileName: "[project]/components/shared/AuthStatus.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/shared/AuthStatus.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this);
    }
    if (user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setShowMenu(!showMenu),
                    className: "flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wifi$3e$__["Wifi"], {
                            size: 16,
                            className: "text-green-600"
                        }, void 0, false, {
                            fileName: "[project]/components/shared/AuthStatus.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm font-medium text-green-800",
                            children: "Online"
                        }, void 0, false, {
                            fileName: "[project]/components/shared/AuthStatus.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                            size: 16,
                            className: "text-green-600"
                        }, void 0, false, {
                            fileName: "[project]/components/shared/AuthStatus.tsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/shared/AuthStatus.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                showMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "fixed inset-0 z-10",
                            onClick: ()=>setShowMenu(false)
                        }, void 0, false, {
                            fileName: "[project]/components/shared/AuthStatus.tsx",
                            lineNumber: 89,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-3 border-b border-gray-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-gray-500",
                                            children: "Account"
                                        }, void 0, false, {
                                            fileName: "[project]/components/shared/AuthStatus.tsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-gray-900 truncate",
                                            children: user.email
                                        }, void 0, false, {
                                            fileName: "[project]/components/shared/AuthStatus.tsx",
                                            lineNumber: 96,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/shared/AuthStatus.tsx",
                                    lineNumber: 94,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleLogout,
                                    disabled: loggingOut,
                                    className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50",
                                    children: loggingOut ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                size: 16,
                                                className: "animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/components/shared/AuthStatus.tsx",
                                                lineNumber: 105,
                                                columnNumber: 21
                                            }, this),
                                            "Disconnessione..."
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/components/shared/AuthStatus.tsx",
                                                lineNumber: 110,
                                                columnNumber: 21
                                            }, this),
                                            "Logout"
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/components/shared/AuthStatus.tsx",
                                    lineNumber: 98,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/shared/AuthStatus.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/components/shared/AuthStatus.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wifi$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__WifiOff$3e$__["WifiOff"], {
                        size: 16,
                        className: "text-gray-400"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/AuthStatus.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-600",
                        children: "Offline"
                    }, void 0, false, {
                        fileName: "[project]/components/shared/AuthStatus.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/shared/AuthStatus.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>router.push('/login'),
                className: "flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$in$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogIn$3e$__["LogIn"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/components/shared/AuthStatus.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    "Login"
                ]
            }, void 0, true, {
                fileName: "[project]/components/shared/AuthStatus.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/shared/AuthStatus.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
_s(AuthStatus, "7cBCBP1OYRxx+6toRPXoSE8M2gM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuthStatus;
var _c;
__turbopack_context__.k.register(_c, "AuthStatus");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/shared/InstallPrompt.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Install Prompt Component
 * Mostra prompt per installare PWA su schermata home
 */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const InstallPrompt = ()=>{
    _s();
    const [deferredPrompt, setDeferredPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showPrompt, setShowPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isInstalled, setIsInstalled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InstallPrompt.useEffect": ()=>{
            // Verifica se app è già installata
            if ("TURBOPACK compile-time truthy", 1) {
                // Verifica se è in standalone mode (app installata)
                const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
                setIsInstalled(isStandalone);
                if (isStandalone) {
                    return; // App già installata, non mostrare prompt
                }
            }
            // Ascolta evento beforeinstallprompt
            const handleBeforeInstallPrompt = {
                "InstallPrompt.useEffect.handleBeforeInstallPrompt": (e)=>{
                    e.preventDefault();
                    setDeferredPrompt(e);
                    setShowPrompt(true);
                }
            }["InstallPrompt.useEffect.handleBeforeInstallPrompt"];
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            // Verifica se utente ha già rifiutato l'installazione
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            if (dismissed) {
                const dismissedTime = parseInt(dismissed, 10);
                const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
                // Mostra di nuovo dopo 7 giorni
                if (daysSinceDismissed < 7) {
                    setShowPrompt(false);
                }
            }
            return ({
                "InstallPrompt.useEffect": ()=>{
                    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                }
            })["InstallPrompt.useEffect"];
        }
    }["InstallPrompt.useEffect"], []);
    const handleInstall = async ()=>{
        if (!deferredPrompt) {
            return;
        }
        try {
            // Mostra prompt installazione
            await deferredPrompt.prompt();
            // Attendi scelta utente
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setShowPrompt(false);
                setIsInstalled(true);
            } else {
                console.log('User dismissed the install prompt');
                // Salva che utente ha rifiutato
                localStorage.setItem('pwa-install-dismissed', Date.now().toString());
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Error showing install prompt:', error);
        }
    };
    const handleDismiss = ()=>{
        setShowPrompt(false);
        // Salva che utente ha rifiutato
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };
    // Non mostrare se app è già installata o prompt non disponibile
    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-lg shadow-xl border-2 border-green-200 p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                className: "text-green-600",
                                size: 24
                            }, void 0, false, {
                                fileName: "[project]/components/shared/InstallPrompt.tsx",
                                lineNumber: 108,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/shared/InstallPrompt.tsx",
                            lineNumber: 107,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/shared/InstallPrompt.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-bold text-gray-800 mb-1",
                                children: "Installa OrtoMio"
                            }, void 0, false, {
                                fileName: "[project]/components/shared/InstallPrompt.tsx",
                                lineNumber: 112,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-600 mb-3",
                                children: "Aggiungi OrtoMio alla schermata home per un accesso rapido e funzionamento offline."
                            }, void 0, false, {
                                fileName: "[project]/components/shared/InstallPrompt.tsx",
                                lineNumber: 115,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleInstall,
                                        className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm",
                                        children: "Installa"
                                    }, void 0, false, {
                                        fileName: "[project]/components/shared/InstallPrompt.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleDismiss,
                                        className: "px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors",
                                        "aria-label": "Chiudi",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            size: 20
                                        }, void 0, false, {
                                            fileName: "[project]/components/shared/InstallPrompt.tsx",
                                            lineNumber: 130,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/shared/InstallPrompt.tsx",
                                        lineNumber: 125,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/shared/InstallPrompt.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/shared/InstallPrompt.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/shared/InstallPrompt.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/shared/InstallPrompt.tsx",
            lineNumber: 104,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/shared/InstallPrompt.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(InstallPrompt, "TLP+Da+iYWRHVAzKIDGB8JIQ90c=");
_c = InstallPrompt;
const __TURBOPACK__default__export__ = InstallPrompt;
var _c;
__turbopack_context__.k.register(_c, "InstallPrompt");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$TierContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/context/TierContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/context/StorageContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useAuth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/hooks/useAuth.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/storage/factory.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/hooks/useTier.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/config/tiers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$consumer$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/consumer/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$professional$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/professional/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$FreeSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/shared/FreeSidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$GlobalSearch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/shared/GlobalSearch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$AuthStatus$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/shared/AuthStatus.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$InstallPrompt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/shared/InstallPrompt.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
function DashboardContent({ children }) {
    _s();
    const { isProfessional, isConsumer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"])();
    const getSidebar = ()=>{
        if (isProfessional) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$professional$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProfessionalSidebar"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/layout.tsx",
                lineNumber: 22,
                columnNumber: 14
            }, this);
        }
        if (isConsumer) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$consumer$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ConsumerSidebar"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/layout.tsx",
                lineNumber: 25,
                columnNumber: 14
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$FreeSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FreeSidebar"], {}, void 0, false, {
            fileName: "[project]/app/(dashboard)/layout.tsx",
            lineNumber: 27,
            columnNumber: 12
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-screen",
        style: {
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #d1fae5 75%, #ecfdf5 100%)',
            backgroundAttachment: 'fixed'
        },
        children: [
            getSidebar(),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 py-3 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 max-w-md",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$GlobalSearch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/layout.tsx",
                                        lineNumber: 41,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/layout.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "ml-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$AuthStatus$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/layout.tsx",
                                        lineNumber: 44,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/layout.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/layout.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$shared$2f$InstallPrompt$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/layout.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/layout.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(DashboardContent, "vWxVd9+TLPVN7yBD5jwKas8G/h4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useTier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTier"]
    ];
});
_c = DashboardContent;
function DashboardLayout({ children }) {
    const storageProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$storage$2f$factory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultStorageProvider"])();
    // LOCALE: Sblocca tutte le feature impostando PRO_PROFESSIONAL di default
    // In produzione, ripristinare AppTier.FREE
    const isLocalDev = ("TURBOPACK compile-time value", "development") === 'development' || ("TURBOPACK compile-time value", "object") !== 'undefined' && window.location.hostname === 'localhost';
    const defaultTier = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$config$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppTier"].PRO_PROFESSIONAL : "TURBOPACK unreachable";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$hooks$2f$useAuth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$StorageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StorageProvider"], {
            initialProvider: storageProvider,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$context$2f$TierContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TierProvider"], {
                defaultTier: defaultTier,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardContent, {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/layout.tsx",
                    lineNumber: 71,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/layout.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/layout.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/layout.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
_c1 = DashboardLayout;
var _c, _c1;
__turbopack_context__.k.register(_c, "DashboardContent");
__turbopack_context__.k.register(_c1, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_5150211c._.js.map