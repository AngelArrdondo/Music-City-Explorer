const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export async function searchItunes(term, limit = 10) {
  try {
    // Añadimos "music" al término para filtrar mejor el tipo de contenido
    const query = term || "hits";
    
    // Eliminamos country=mx para permitir resultados en inglés y español (Global)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}&lang=es_mx`;    
    const url = `${CORS_PROXY}${itunesUrl}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`iTunes error: ${res.status}`);
    
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Error en iTunes API:", error);
    return [];
  }
}