import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { animalService } from '../services/animalService'
import { Link } from 'react-router-dom'

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})
L.Marker.prototype.options.icon = DefaultIcon

/**
 * MapView.jsx — Interactive Animal Map
 * Route: /map
 * Access: Public
 */
export default function MapView() {
  const [animals, setAnimals] = useState([])
  const [center] = useState([6.9271, 79.8612]) // Default to Colombo

  useEffect(() => {
    fetchAnimals()
  }, [])

  const fetchAnimals = async () => {
    try {
      const response = await animalService.getAll()
      setAnimals(response.data.data.animals)
    } catch (err) {
      console.error('Failed to fetch map data:', err)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {animals.map(animal => (
          <Marker 
            key={animal.id} 
            position={[parseFloat(animal.latitude), parseFloat(animal.longitude)]}
          >
            <Popup className="rounded-2xl overflow-hidden">
              <div className="w-48">
                <img 
                  src={animal.thumbnail ? `http://localhost:5000${animal.thumbnail}` : 'https://via.placeholder.com/200x120?text=No+Image'} 
                  alt={animal.breed} 
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-gray-900">{animal.breed || animal.type}</h3>
                <p className="text-xs text-gray-500 mb-2 truncate">{animal.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    animal.rescue_urgency === 'critical' ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {animal.rescue_urgency}
                  </span>
                  <Link to={`/animals/${animal.id}`} className="text-primary-600 text-xs font-bold hover:underline">
                    Details &rarr;
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute top-6 left-12 z-[1000] hidden md:block">
        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-xs">
          <h2 className="text-xl font-black text-gray-900 mb-2">Rescue Map 🗺️</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            See active rescues and strays in your area. Click a marker to see more details or start an adoption.
          </p>
          <div className="mt-4 flex items-center text-xs font-bold text-gray-400">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            {animals.length} Active Pins
          </div>
        </div>
      </div>
    </div>
  )
}
