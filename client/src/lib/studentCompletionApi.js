const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function request(path, token, options = {}) {
    const response = await fetch(`${API_URL}/api/experiment-completions${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Unable to load experiment progress.");
    }

    return data;
}

export const studentCompletionApi = {
    getSummary: (token) => request("", token),

    getStatus: (experimentId, token) =>
        request(`/${encodeURIComponent(experimentId)}`, token),

    markComplete: (experimentId, token) =>
        request(`/${encodeURIComponent(experimentId)}`, token, {
            method: "POST",
        }),
};
