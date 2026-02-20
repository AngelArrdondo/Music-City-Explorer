import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import { getCityInfo } from "./services/wikiApi";
import { searchItunes } from "./services/itunesApi";
import { searchDeezer } from "./services/deezerApi";
import TrackList from "./components/TrackList";
import axios from "axios";

// Importaciones de Firebase
import { db } from "./services/firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, writeBatch } from "firebase/firestore";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [wikiData, setWikiData] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [mapCenter, setMapCenter] = useState([23.6345, -102.5528]);
  const [history, setHistory] = useState([]);

  const API_KEY = "2127f8952f8cddbafa227a53d6d2fcf3";

  // 1. Carga inicial del historial y ubicación
  useEffect(() => {
    const init = async () => {
      await fetchHistory(); 
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          // isInitial = true para evitar duplicar en el primer render
          (pos) => fetchAllAppData(null, pos.coords.latitude, pos.coords.longitude, false, true),
          () => fetchAllAppData("Queretaro", null, null, false, true) 
        );
      } else {
        fetchAllAppData("Queretaro", null, null, false, true);
      }
    };
    init();
  }, []);

  // 2. Obtener historial de Firebase
  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "historial"), orderBy("fecha", "desc"), limit(6));
      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setHistory(docs);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  };

  // 3. Borrar todo el historial de Firebase
  const clearHistory = async () => {
    if (window.confirm("¿Estás seguro de que quieres borrar todo el historial?")) {
      try {
        const querySnapshot = await getDocs(collection(db, "historial"));
        const batch = writeBatch(db);
        querySnapshot.forEach((documento) => {
          batch.delete(doc(db, "historial", documento.id));
        });
        await batch.commit();
        setHistory([]);
        alert("Historial eliminado");
      } catch (error) {
        console.error("Error al eliminar historial:", error);
      }
    }
  };

  // 4. Normalizar datos de canciones (incluyendo preview de audio)
  const normalizeTrack = (t, source) => ({
    id: t.trackId || t.id || Math.random(),
    title: t.trackName || t.title || "Sin título",
    artist: t.artistName || t.artist?.name || "Artista desconocido",
    album: t.collectionName || t.album?.title || "Álbum",
    image: t.artworkUrl100 || t.album?.cover_medium || "https://via.placeholder.com/150",
    // ✅ Probamos todas las combinaciones posibles de las APIs
    preview: t.previewUrl || t.preview || t.preview_url || "", 
    source
  });

  // 5. Función principal para buscar datos
  const fetchAllAppData = async (cityName, lat = null, lon = null, isHistoryClick = false, isInitial = false) => {
    setLoading(true);
    setSongs([]);

    try {
      let url = lat && lon 
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
        : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=es`;

      const res = await axios.get(url);
      const data = res.data;
      const currentCityName = data.name;

      setMapCenter([data.coord.lat, data.coord.lon]);

      const main = data.weather[0].main.toLowerCase();
      let keyword;

      switch (main) {
        case "clear": 
          // Mezcla de pop actual en ambos idiomas
          keyword = "pop exitos hits 2026"; 
          break;
        case "rain":
        case "drizzle": 
          // Término bilingüe para asegurar variedad
          keyword = "baladas rock español ingles"; 
          break;
        case "clouds": 
          keyword = "indie alternative latino pop"; 
          break;
        case "snow": 
          keyword = "acoustic winter hits"; 
          break;
        case "thunderstorm": 
          keyword = "rock metal clasicos"; 
          break;
        case "mist":
        case "fog": 
          keyword = "ambient chill español english"; 
          break;
        default: 
          keyword = "top global music";
      }

      setWeatherData({
        city: currentCityName,
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        keyword
      });

      // Lógica de No Duplicados
      const alreadyInHistory = history.some(
        (item) => item.ciudad.toLowerCase() === currentCityName.toLowerCase()
      );

      if (!isInitial && !isHistoryClick && !alreadyInHistory) {
        try {
          await addDoc(collection(db, "historial"), {
            ciudad: currentCityName,
            clima: data.weather[0].description,
            temp: Math.round(data.main.temp),
            mood: keyword,
            fecha: serverTimestamp()
          });
          fetchHistory();
        } catch (dbError) {
          console.error("Error al guardar en Firebase:", dbError);
        }
      }

      const results = await Promise.allSettled([
        getCityInfo(currentCityName),
        searchItunes(keyword, 6),
        searchDeezer(keyword, 6)
      ]);

      const wiki = results[0].status === 'fulfilled' ? results[0].value : null;
      const itunesSongs = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
      const deezerSongs = results[2].status === 'fulfilled' && Array.isArray(results[2].value) ? results[2].value : [];

      setWikiData(wiki);
      
      const combinedSongs = [
        ...itunesSongs.map(t => normalizeTrack(t, "iTunes")),
        ...deezerSongs.map(t => normalizeTrack(t, "Deezer"))
      ].filter(song => song.preview !== "");

      setSongs(combinedSongs);

    } catch (error) {
      console.error("Error general:", error);
    } finally {
      setLoading(false);
      setManualCity(""); 
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#1a73e8", fontSize: "2.5rem", marginBottom: "10px" }}>🎵 Music City Explorer</h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Ej: Tokyo, Paris, Madrid..."
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAllAppData(manualCity)}
            style={{ padding: "14px 20px", width: "350px", borderRadius: "30px 0 0 30px", border: "1px solid #ddd", outline: "none", fontSize: "16px" }}
          />
          <button onClick={() => fetchAllAppData(manualCity)} style={{ padding: "14px 25px", borderRadius: "0 30px 30px 0", background: "#1a73e8", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>
            Buscar
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", height: "400px" }}>
            <MapView center={mapCenter} onLocationFound={(lat, lng) => fetchAllAppData(null, lat, lng)} />
          </div>

          <div style={{ padding: "20px", background: "white", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ color: "#1a73e8", margin: 0 }}>🕒 Búsquedas Recientes</h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  style={{ background: "#ff4d4d", color: "white", border: "none", padding: "5px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                >
                  Borrar Todo
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => fetchAllAppData(item.ciudad, null, null, true)}
                  style={{ 
                    padding: "12px 16px", 
                    background: "#ffffff", 
                    borderRadius: "12px", 
                    border: "1px solid #e0e0e0", 
                    cursor: "pointer",
                    transition: "transform 0.2s, border-color 0.2s",
                    minWidth: "140px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.borderColor = "#1a73e8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor = "#e0e0e0";
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#1a73e8" }}>{item.ciudad}</div>
                  <div style={{ fontSize: "13px", color: "#444", margin: "4px 0" }}>
                    {item.temp}°C - <span style={{ textTransform: "capitalize" }}>{item.clima}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#777", fontStyle: "italic" }}>
                    Mood: {item.mood}
                  </div>
                </div>
              ))}
              {history.length === 0 && <p style={{ color: "#999", fontSize: "14px" }}>No hay búsquedas recientes.</p>}
            </div>
          </div>

          {wikiData && (
            <div style={{ padding: "30px", background: "white", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <h2 style={{ color: "#1a73e8", marginBottom: "15px" }}>Sobre {weatherData?.city}</h2>
              {wikiData.image && <img src={wikiData.image} alt="city" style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: "15px", marginBottom: "20px" }} />}
              <p style={{ lineHeight: "1.8", color: "#444" }}>{wikiData.extract}</p>
            </div>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          {weatherData && (
            <div style={{ padding: "25px", backgroundColor: "white", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <h3 style={{ textTransform: "capitalize", color: "#5f6368" }}>{weatherData.condition}</h3>
              <p style={{ fontSize: "56px", fontWeight: "800", color: "#1a73e8", margin: "10px 0" }}>{weatherData.temp}°C</p>
              <div style={{ backgroundColor: "#e8f0fe", padding: "12px", borderRadius: "12px", color: "#1967d2", fontWeight: "600" }}>
                Mood: {weatherData.keyword}
              </div>
            </div>
          )}

          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", flex: 1 }}>
            <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>🎧 Playlist Recomendada</h3>
            {/* ✅ CORRECCIÓN: Pasamos onSelect para evitar el error */}
            {loading ? (
              <p style={{ textAlign: "center", color: "#70757a" }}>Sintonizando...</p>
            ) : (
              <TrackList 
                items={songs} 
                onSelect={(song) => console.log("Reproduciendo: ", song.title)} 
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;