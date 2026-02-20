import React from "react";
import TrackCard from "./TrackCard";

export default function TrackList({ items, onSelect }) {
    if (!items || items.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: "14px" }}>
                Buscando canciones que combinen con el clima...
            </div>
        );
    }

    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "10px",
            maxHeight: "550px", 
            overflowY: "auto",  
            paddingRight: "8px"
        }}>
            {items.map((t) => (
                <TrackCard
                    key={t.id}
                    title={t.title}
                    artist={t.artist}
                    album={t.album}
                    image={t.image}
                    source={t.source}
                    preview={t.preview} // <--- Esto es vital
                    onSelect={() => onSelect(t)}
                />
            ))}
        </div>
    );
}