import axios from 'axios';

const API_KEY = "a12542d24aff8d9868fe8a63bb08689e";

export async function getWeather(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
        const res = await axios.get(url);
        const data = res.data;
        
        // Mapeo de clima a palabra clave musical
        let keyword = "chill";
        const mainWeather = data.weather[0].main.toLowerCase();

        if (mainWeather.includes("rain") || mainWeather.includes("drizzle")) keyword = "rain";
        else if (mainWeather.includes("clear")) keyword = "happy";
        else if (mainWeather.includes("clouds")) keyword = "lofi";
        else if (mainWeather.includes("snow")) keyword = "winter";
        else if (mainWeather.includes("thunderstorm")) keyword = "rock";

        return {
            city: data.name,
            temp: Math.round(data.main.temp),
            condition: data.weather[0].description,
            keyword: keyword
        };
    } catch (error) {
        console.error("Error al obtener clima:", error);
        return null;
    }
}