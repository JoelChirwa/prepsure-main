
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function getExperiments(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search?.trim()) {
        params.set("search", filters.search.trim());
    }

    if (filters.category && filters.category !== "All") {
        params.set("category", filters.category);
    }

    if (filters.difficulty && filters.difficulty !== "All") {
        params.set("difficulty", filters.difficulty);
    }

    const query = params.toString();
    const url = `${API_URL}/api/experiments${query ? `?${query}` : ""}`;

    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Could not load experiments.");
    }

    // Support either a plain array or { experiments: [...] }.
    return Array.isArray(data) ? data : data.experiments || [];
}

export async function getExperimentBySlug(slug) {
    const response = await fetch(
        `${API_URL}/api/experiments/${encodeURIComponent(slug)}`
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }

        throw new Error(data.message || "Could not load this experiment.");
    }

    return data.experiment || data;
}
