(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/services/icloudSyncService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * iCloud Sync Service
 * Sincronizzazione con iCloud Drive per iOS
 * Usa Capacitor Filesystem API per accesso file system
 */ __turbopack_context__.s([
    "detectiCloudBackups",
    ()=>detectiCloudBackups,
    "restoreFromiCloud",
    ()=>restoreFromiCloud,
    "syncToiCloud",
    ()=>syncToiCloud
]);
async function syncToiCloud(data) {
    try {
        const { Filesystem, Directory } = await __turbopack_context__.A("[project]/node_modules/@capacitor/filesystem/dist/esm/index.js [app-client] (ecmascript, async loader)");
        const filename = `ortomio-backup-${data.garden.id}-${new Date().toISOString().split('T')[0]}.json`;
        const path = `OrtoMio/Backups/${filename}`;
        // Crea directory se non esiste
        try {
            await Filesystem.mkdir({
                path: 'OrtoMio/Backups',
                directory: Directory.ExternalStorage,
                recursive: true
            });
        } catch (error) {
            // Directory potrebbe già esistere, ignora errore
            if (error.message && !error.message.includes('already exists')) {
                throw error;
            }
        }
        // Salva file su iCloud Drive
        await Filesystem.writeFile({
            path,
            data: JSON.stringify(data, null, 2),
            directory: Directory.ExternalStorage
        });
        console.log('✅ Backup sincronizzato su iCloud Drive:', path);
    } catch (error) {
        // Se Capacitor non disponibile o errore, fallback silenzioso
        if (error.message && error.message.includes('Capacitor')) {
            console.warn('Capacitor not available, iCloud sync skipped');
            return;
        }
        throw error;
    }
}
async function detectiCloudBackups() {
    try {
        const { Filesystem, Directory } = await __turbopack_context__.A("[project]/node_modules/@capacitor/filesystem/dist/esm/index.js [app-client] (ecmascript, async loader)");
        // Leggi directory backup
        const result = await Filesystem.readdir({
            path: 'OrtoMio/Backups',
            directory: Directory.ExternalStorage
        });
        const backups = [];
        for (const file of result.files){
            if (file.name.startsWith('ortomio-backup-') && file.name.endsWith('.json')) {
                // Estrai gardenId e timestamp dal filename
                const match = file.name.match(/ortomio-backup-([^-]+)-(\d{4}-\d{2}-\d{2})\.json/);
                const timestamp = match ? `${match[2]}T00:00:00.000Z` : new Date().toISOString();
                backups.push({
                    source: 'icloud',
                    filename: file.name,
                    path: `OrtoMio/Backups/${file.name}`,
                    timestamp,
                    size: file.size || 0,
                    gardenId: match ? match[1] : undefined
                });
            }
        }
        return backups;
    } catch (error) {
        // Se Capacitor non disponibile o directory non esiste, ritorna array vuoto
        if (error.message && (error.message.includes('Capacitor') || error.message.includes('does not exist'))) {
            return [];
        }
        throw error;
    }
}
async function restoreFromiCloud(backup) {
    try {
        const { Filesystem, Directory } = await __turbopack_context__.A("[project]/node_modules/@capacitor/filesystem/dist/esm/index.js [app-client] (ecmascript, async loader)");
        const file = await Filesystem.readFile({
            path: backup.path,
            directory: Directory.ExternalStorage
        });
        return JSON.parse(file.data);
    } catch (error) {
        console.error('Error restoring from iCloud:', error);
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=services_icloudSyncService_ts_a4633b84._.js.map