const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

export async function getStudentProgress(token) {
  const response = await fetch(`${API_URL}/api/student-progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("prepsure:unauthorized"));
    }
    throw new Error(data.message || "Unable to load your learning progress.");
  }

  return data;
}
