const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

async function request(path, { token, ...options } = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
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

export const studentQuizApi = {
    list: (token) => request("/api/quizzes", { token }),
    get: (token, quizId) =>
        request(`/api/quizzes/${encodeURIComponent(quizId)}`, { token }),
    submit: (token, quizId, payload) =>
        request(`/api/quizzes/${encodeURIComponent(quizId)}/attempts`, {
            token,
            method: "POST",
            body: JSON.stringify(payload),
        }),
    listAttempts: (token) =>
        request("/api/quizzes/attempts", { token }),
    getAttempt: (token, attemptId) =>
        request(`/api/quizzes/attempts/${encodeURIComponent(attemptId)}`, {
            token,
        }),
};

export const studentMockExamApi = {
    list: (token) => request("/api/mock-exams", { token }),
    start: (token, examId, requestId) =>
        request(`/api/mock-exams/${encodeURIComponent(examId)}/attempts`, {
            token,
            method: "POST",
            body: JSON.stringify({ requestId }),
        }),
    getAttempt: (token, attemptId) =>
        request(`/api/mock-exams/attempts/${encodeURIComponent(attemptId)}`, {
            token,
        }),
    saveAnswer: (token, attemptId, questionId, selectedOptionId) =>
        request(`/api/mock-exams/attempts/${encodeURIComponent(attemptId)}/answers`, {
            token,
            method: "PATCH",
            body: JSON.stringify({ questionId, selectedOptionId }),
        }),
    submit: (token, attemptId) =>
        request(`/api/mock-exams/attempts/${encodeURIComponent(attemptId)}/submit`, {
            token,
            method: "POST",
        }),
};

export const adminQuizApi = {
    list: (token, includeRetired = false) =>
        request(
            `/api/admin/quizzes${includeRetired ? "?includeRetired=true" : ""}`,
            { token }
        ),
    get: (token, quizId) =>
        request(`/api/admin/quizzes/${encodeURIComponent(quizId)}`, { token }),
    create: (token, payload) =>
        request("/api/admin/quizzes", {
            token,
            method: "POST",
            body: JSON.stringify(payload),
        }),
    update: (token, quizId, payload) =>
        request(`/api/admin/quizzes/${encodeURIComponent(quizId)}`, {
            token,
            method: "PUT",
            body: JSON.stringify(payload),
        }),
    retire: (token, quizId) =>
        request(`/api/admin/quizzes/${encodeURIComponent(quizId)}`, {
            token,
            method: "DELETE",
        }),
};
