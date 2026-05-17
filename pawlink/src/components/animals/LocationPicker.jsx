import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

export default function LocationPicker({ position, onPositionChange, disabled = false }) {
  const [markerPosition, setMarkerPosition] = useState(position || [6.9271, 79.8612])

  function MapEvents() {
    useMapEvents({
      click(e) {
        if (disabled) return
        const newPos = [e.latlng.lat, e.latlng.lng]
        setMarkerPosition(newPos)
        if (onPositionChange) onPositionChange(newPos)
      },
    })
    return null
  }

  return (
    <div className="h-64 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
      <MapContainer 
        center={markerPosition} 
        zoom={13} 
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={markerPosition} />
        <MapEvents />
      </MapContainer>
      {!disabled && (
        <div className="bg-gray-50 p-2 text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
          Click on the map to pin the exact location
        </div>
      )}
    </div>
  )
}
