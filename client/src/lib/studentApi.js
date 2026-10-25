
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function request(path, options = {}) {
    const response = await fetch(`${API_URL}/api/auth${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

export const studentApi = {
    register: (details) =>
        request("/register", {
            method: "POST",
            body: JSON.stringify(details),
        }),

    login: (credentials) =>
        request("/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        }),

    me: (token) =>
        request("/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }),

    updateProfile: (token, profile) =>
        request("/me", {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profile),
        }),

    changePassword: (token, passwords) =>
        request("/password", {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(passwords),
        }),

    changePin: (token, pins) =>
        request("/pin", {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(pins),
        }),

    requestPasswordReset: (email) =>
        request("/password/forgot", {
            method: "POST",
            body: JSON.stringify({ email }),
        }),

    resetPassword: (token, newPassword) =>
        request("/password/reset", {
            method: "POST",
            body: JSON.stringify({ token, newPassword }),
        }),

    recoverPin: (details) =>
        request("/pin/recover", {
            method: "POST",
            body: JSON.stringify(details),
        }),

    syncSimulationAttempt: (token, attempt) =>
        request("/simulation-attempts/sync", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(attempt),
        }),

    createSimulationChallenge: (token, attempt) =>
        requestExternal("/api/simulation-challenges", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(attempt),
        }),

    getSimulationChallenge: (code) =>
        requestExternal(`/api/simulation-challenges/${encodeURIComponent(code)}`),

    submitSimulationChallenge: (code, score) =>
        requestExternal(`/api/simulation-challenges/${encodeURIComponent(code)}/result`, {
            method: "POST",
            body: JSON.stringify({ score }),
        }),
};

async function requestExternal(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
}
