import axios from 'axios';

export async function getCityInfo(cityName) {
    try {
        // Usamos la API de Wikipedia en español
        const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
        const response = await axios.get(url);
        
        return {
            extract: response.data.extract || "No hay resumen disponible.",
            image: response.data.thumbnail ? response.data.thumbnail.source : null,
            url: response.data.content_urls?.desktop?.page || "https://es.wikipedia.org"
        };
    } catch (error) {
        console.error("Error Wikipedia:", error);
        return {
            extract: "Información no encontrada.",
            image: null,
            url: "#"
        };
    }
}