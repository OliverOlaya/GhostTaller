const GHOST_DB_NAME = "ghostMotorsDB";
const GHOST_DB_VERSION = 1;
const GHOST_STORE_NAME = "siteData";
const GHOST_SITE_KEY = "ghostSiteData";
const LEGACY_STORAGE_KEY = "ghostMotorsData";

function openGhostDatabase() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error("IndexedDB no está disponible en este navegador."));
            return;
        }

        const request = window.indexedDB.open(GHOST_DB_NAME, GHOST_DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(GHOST_STORE_NAME)) {
                db.createObjectStore(GHOST_STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("No se pudo abrir la base de datos."));
    });
}

async function saveGhostSiteData(data) {
    try {
        const db = await openGhostDatabase();
        const tx = db.transaction(GHOST_STORE_NAME, "readwrite");
        const store = tx.objectStore(GHOST_STORE_NAME);

        await new Promise((resolve, reject) => {
            const request = store.put({ id: GHOST_SITE_KEY, value: data });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error || new Error("No se pudo guardar la información."));
        });

        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
        return data;
    } catch (error) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
        return data;
    }
}

async function getGhostSiteData() {
    try {
        const db = await openGhostDatabase();
        const tx = db.transaction(GHOST_STORE_NAME, "readonly");
        const store = tx.objectStore(GHOST_STORE_NAME);

        const result = await new Promise((resolve, reject) => {
            const request = store.get(GHOST_SITE_KEY);
            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = () => reject(request.error || new Error("No se pudo leer la base de datos."));
        });

        if (result) {
            localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(result));
            return result;
        }

        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);

        if (legacyData) {
            const parsed = JSON.parse(legacyData);
            await saveGhostSiteData(parsed);
            return parsed;
        }

        return null;
    } catch (error) {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);

        if (legacyData) {
            try {
                return JSON.parse(legacyData);
            } catch (parseError) {
                return null;
            }
        }

        return null;
    }
}

async function hydrateLegacyFromDatabase() {
    const data = await getGhostSiteData();

    if (data) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
}
