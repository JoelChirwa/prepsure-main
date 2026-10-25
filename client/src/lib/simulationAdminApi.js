const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

async function request(path, token, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Could not update simulation.");
    return data;
}

export const simulationAdminApi = {
    list: (token) => request("/api/admin/simulations", token),
    update: (token, slug, payload) =>
        request(`/api/admin/simulations/${encodeURIComponent(slug)}`, token, {
            method: "PATCH",
            body: JSON.stringify(payload),
        }),
};
