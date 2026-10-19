
const API_URL = import.meta.env.VITE_API_URL;

export async function getVenues() {
  if (!API_URL) {
    throw new Error("VITE_API_URL is missing");
  }

  const response = await fetch(`${API_URL}/api/venues`);

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}

/* TEMPORARY BACKEND CONNECTION TEST */

if (import.meta.env.DEV) {
  getVenues()
    .then((data) => {
      console.log("✅ FASTAPI CONNECTED!");
      console.log("Backend Venues:", data);
    })
    .catch((error) => {
      console.error("❌ Backend Connection Failed:", error);
    });
}
