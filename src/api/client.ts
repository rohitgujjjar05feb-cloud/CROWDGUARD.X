
/* const API_URL = import.meta.env.VITE_API_URL;

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
*/

/* TEMPORARY BACKEND CONNECTION TEST */

/*if (import.meta.env.DEV) {
  getVenues()
    .then((data) => {
      console.log("✅ FASTAPI CONNECTED!");
      console.log("Backend Venues:", data);
    })
    .catch((error) => {
      console.error("❌ Backend Connection Failed:", error);
    });
}
*/


// CROWDGUARD X - Backend API Client

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://crowdguard-x-backend.vercel.app"
).replace(/\/+$/, "");

// GET ALL VENUES
export async function getVenues() {
  try {
    const url = `${API_BASE_URL}/api/venues`;

    console.log("Calling Backend:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Backend Error: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Backend Response:", data);

    return data;

  } catch (error) {
    console.error(
      "Backend Connection Failed:",
      error
    );

    throw error;
  }
}
