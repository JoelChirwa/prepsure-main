
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function request(path, token, options = {}) {
    const response = await fetch(`${API_URL}/api/saved-experiments${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to update saved experiments.");
    }

    return data;
}

export const studentSavedApi = {
    getAll: (token) => request("", token),

    save: (experimentId, token) =>
        request(`/${encodeURIComponent(experimentId)}`, token, {
            method: "POST",
        }),

    remove: (experimentId, token) =>
        request(`/${encodeURIComponent(experimentId)}`, token, {
            method: "DELETE",
        }),
};
