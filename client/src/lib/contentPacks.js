const STORAGE_KEY = "prepsure:content-packs";
const CACHE_NAME = "prepsure-content-packs-v1";
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

function readPacks() {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return value && typeof value === "object" ? value : {};
    } catch {
        return {};
    }
}

export function isPackDownloaded(packId) {
    return readPacks()[packId]?.status === "downloaded";
}

export function getPackState(packId) {
    return readPacks()[packId] || null;
}

export async function preparePack(pack, onProgress = () => {}) {
    const packs = readPacks();
    const current = packs[pack.id] || {};
    packs[pack.id] = {
        ...current,
        version: pack.version,
        status: "downloading",
        progress: current.status === "downloading" ? current.progress || 0 : 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));

    try {
        const manifestResponse = await fetch(
            `${API_URL}/api/simulation-packs/${encodeURIComponent(pack.id)}`
        );
        if (!manifestResponse.ok) {
            throw new Error("Could not load the offline pack manifest.");
        }
        const { pack: manifest } = await manifestResponse.json();
        if (manifest.version !== pack.version) {
            throw new Error("This offline pack needs an app update before it can be downloaded.");
        }
        const resources = manifest.resources;
        const cache = "caches" in window ? await caches.open(CACHE_NAME) : null;
        const start = Math.min(packs[pack.id].progress, resources.length);
        for (let index = start; index < resources.length; index += 1) {
            if (cache) {
                await cache.add(resources[index]);
            }
            const progress = Math.round(((index + 1) / resources.length) * 100);
            packs[pack.id] = { ...packs[pack.id], progress };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
            onProgress(progress);
        }
        packs[pack.id] = {
            ...packs[pack.id],
            status: "downloaded",
            progress: 100,
            downloadedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
    } catch (error) {
        packs[pack.id] = { ...packs[pack.id], status: "paused" };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
        throw error;
    }
}

export function removePack(packId) {
    const packs = readPacks();
    delete packs[packId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}
