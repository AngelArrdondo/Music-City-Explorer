const CORS_PROXY = "https://corsproxy.io/?";
const BASE = "https://api.deezer.com";

export async function searchDeezer(term, limit = 10) {
  try {
    const query = term || "music";
    const url = `${CORS_PROXY}${BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Deezer error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error en Deezer:", error);
    return [];
  }
}