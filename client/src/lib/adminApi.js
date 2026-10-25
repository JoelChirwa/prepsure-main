
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

export async function apiRequest(path, options = {}, token = null) {
    const isFormData =
        typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers = {
        ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && token) {
            window.dispatchEvent(new Event("prepsure:unauthorized"));
        }

        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

export const adminApi = {
    me: (token) =>
        apiRequest("/api/auth/me", {}, token),

    listExperiments: (token, search = "") => {
        const params = new URLSearchParams();

        if (search.trim()) params.set("search", search.trim());

        const query = params.toString();

        return apiRequest(
            `/api/experiments/admin${query ? `?${query}` : ""}`,
            {},
            token
        );
    },

    createExperiment: (token, payload) =>
        apiRequest(
            "/api/experiments",
            { method: "POST", body: JSON.stringify(payload) },
            token
        ),

    uploadExperimentImage: (token, file) => {
        const body = new FormData();
        body.append("image", file);
        return apiRequest(
            "/api/experiments/admin/images",
            { method: "POST", body },
            token
        );
    },

    updateExperiment: (token, id, payload) =>
        apiRequest(
            `/api/experiments/${encodeURIComponent(id)}`,
            { method: "PUT", body: JSON.stringify(payload) },
            token
        ),

    deleteExperiment: (token, id) =>
        apiRequest(
            `/api/experiments/${encodeURIComponent(id)}`,
            { method: "DELETE" },
            token
        ),

    listUsers: (token, { search = "", status = "all", page = 1 } = {}) => {
        const params = new URLSearchParams({ status, page: String(page) });
        if (search.trim()) params.set("search", search.trim());
        return apiRequest(`/api/admin/users?${params}`, {}, token);
    },

    updateUserStatus: (token, id, payload) =>
        apiRequest(
            `/api/admin/users/${encodeURIComponent(id)}/status`,
            { method: "PATCH", body: JSON.stringify(payload) },
            token
        ),

    getUserStatusHistory: (token, id) =>
        apiRequest(
            `/api/admin/users/${encodeURIComponent(id)}/status-history`,
            {},
            token
        ),

    listFeedback: (token, { search = "", status = "", category = "", page = 1 } = {}) => {
        const params = new URLSearchParams({ page: String(page) });
        if (search.trim()) params.set("search", search.trim());
        if (status) params.set("status", status);
        if (category) params.set("category", category);
        return apiRequest(`/api/admin/feedback?${params}`, {}, token);
    },

    updateFeedback: (token, id, payload) =>
        apiRequest(
            `/api/admin/feedback/${encodeURIComponent(id)}`,
            { method: "PATCH", body: JSON.stringify(payload) },
            token
        ),
};
