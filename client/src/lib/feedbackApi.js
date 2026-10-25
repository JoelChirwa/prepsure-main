const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function submitFeedback(details) {
    const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Could not send your message.");
    }

    return data;
}
