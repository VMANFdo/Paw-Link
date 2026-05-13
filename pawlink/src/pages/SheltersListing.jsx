import { useState, useEffect } from 'react'
import organizationService from '../services/organizationService'
import ShelterCard from '../components/shelters/ShelterCard'

export default function SheltersListing() {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', animal_type: '' })

  useEffect(() => {
    fetchShelters()
  }, [filters])

  const fetchShelters = async () => {
    try {
      setLoading(true)
      const res = await organizationService.getAllApproved(filters)
      setShelters(res.data.data.organizations)
    } catch (err) {
      console.error('Failed to fetch shelters', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Rescue Shelters 🏠</h1>
        <p className="text-gray-600 text-lg">Find a shelter to adopt from or hand over a found animal.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Location</label>
          <input 
            type="text" 
            placeholder="Search by city..." 
            className="input-field"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Animal Type</label>
          <select 
            className="input-field"
            value={filters.animal_type}
            onChange={(e) => setFilters({ ...filters, animal_type: e.target.value })}
          >
            <option value="">All Animals</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="bird">Birds</option>
            <option value="rabbit">Rabbits</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : shelters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shelters.map(shelter => (
            <ShelterCard key={shelter.id} shelter={shelter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No shelters found matching your search.</p>
        </div>
      )}
    </div>
  )
}
