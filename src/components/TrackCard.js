import React from "react";

export default function TrackCard({ title, artist, image, preview, onSelect }) {
    return (
        <div 
            onClick={onSelect}
            style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: "8px", 
                padding: "12px", 
                background: "#ffffff", 
                borderRadius: "15px", 
                border: "1px solid #eef0f2",
                marginBottom: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img 
                    src={image} 
                    alt={title} 
                    style={{ width: "45px", height: "45px", borderRadius: "8px", objectFit: "cover" }} 
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ 
                        fontWeight: "bold", 
                        fontSize: "14px", 
                        color: "#1a1f36", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis" 
                    }}>
                        {title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#697386" }}>{artist}</div>
                </div>
            </div>

            {/* CONTENEDOR DE AUDIO ESTILIZADO */}
            {preview ? (
                <div style={{ 
                    marginTop: "4px", 
                    background: "#f8f9fa", 
                    borderRadius: "20px", 
                    padding: "2px" 
                }}>
                    <audio 
                        controls 
                        key={preview} 
                        style={{ width: "100%", height: "30px" }}
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <source src={preview} type="audio/mpeg" />
                        Tu navegador no soporta audio.
                    </audio>
                </div>
            ) : (
                <div style={{ 
                    fontSize: "10px", 
                    color: "#ff4d4d", 
                    background: "#fff0f0", 
                    padding: "6px", 
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "500"
                }}>
                    ⚠️ Preview de audio no disponible
                </div>
            )}
        </div>
    );
}