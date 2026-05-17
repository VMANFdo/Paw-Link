import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

export default function LocationPicker({ position, onPositionChange, disabled = false }) {
  const [markerPosition, setMarkerPosition] = useState(position || [6.9271, 79.8612])

  useEffect(() => {
    if (position && position.length === 2 && position[0] !== undefined && position[1] !== undefined) {
      setMarkerPosition([Number(position[0]), Number(position[1])])
    }
  }, [position?.[0], position?.[1]])

  function MapUpdater({ pos }) {
    const map = useMap()
    useEffect(() => {
      if (pos && pos.length === 2 && pos[0] !== undefined && pos[1] !== undefined) {
        map.setView([Number(pos[0]), Number(pos[1])], map.getZoom())
      }
    }, [pos?.[0], pos?.[1], map])
    return null
  }

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
        <MapUpdater pos={markerPosition} />
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
