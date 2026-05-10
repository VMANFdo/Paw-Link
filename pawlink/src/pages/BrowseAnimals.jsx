import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animalService } from '../services/animalService'
import { useAuth } from '../context/AuthContext'
import AnimalCard from '../components/animals/AnimalCard'

export default function BrowseAnimals() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', urgency: '', city: '' })

  useEffect(() => {
    fetchAnimals()
  }, [filters])

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await animalService.getCities()
        setCities(res.data.data.cities)
      } catch (err) {
        console.error('Failed to fetch cities', err)
      }
    }
    fetchCities()
  }, [])

  const fetchAnimals = async () => {
    setLoading(true)
    try {
      const response = await animalService.getAll({
        type: filters.type || undefined,
        urgency: filters.urgency || undefined,
        city: filters.city || undefined
      })
      setAnimals(response.data.data.animals)
    } catch (err) {
      console.error('Failed to fetch animals:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      {/* ── Header & Filter Section ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div className="max-w-xl">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Find a <span className="text-primary-600">Furry Friend</span> 🐾
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Browse through our list of strays looking for a home. 
            Use filters to find Species, Location, or Urgency.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center bg-white p-2 rounded-3xl shadow-2xl shadow-primary-100/20 border border-gray-100">
            {/* City Filter */}
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-primary-50 rounded-2xl transition-all cursor-pointer group relative">
              <span className="text-xl group-hover:rotate-12 transition-transform">📍</span>
              <select 
                className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm cursor-pointer min-w-[130px] appearance-none pr-8 relative z-10"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="">All Locations</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="w-[1px] h-8 bg-gray-100 hidden md:block mx-1"></div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-primary-50 rounded-2xl transition-all cursor-pointer group relative">
              <span className="text-xl group-hover:rotate-12 transition-transform">🐾</span>
              <select 
                className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm cursor-pointer min-w-[120px] appearance-none pr-8 relative z-10"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Species</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
                <option value="other">Others</option>
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="w-[1px] h-8 bg-gray-100 hidden md:block mx-1"></div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-primary-50 rounded-2xl transition-all cursor-pointer group relative">
              <span className="text-xl group-hover:rotate-12 transition-transform">⚡</span>
              <select 
                className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm cursor-pointer min-w-[140px] appearance-none pr-8 relative z-10"
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
              >
                <option value="">All Urgency Levels</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Urgency</option>
                <option value="medium">Medium</option>
              </select>
              <svg className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {user?.role !== 'admin' && (
            <Link 
              to="/add-animal" 
              className="bg-primary-600 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-2xl">+</span>
              Post Animal
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 animate-pulse h-96 rounded-3xl"></div>
          ))}
        </div>
      ) : animals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {animals.map(animal => (
            <AnimalCard key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No animals found</h2>
          <p className="text-gray-500 mb-8">Try adjusting your filters or check back later!</p>
          <button 
            onClick={() => setFilters({ type: '', urgency: '', city: '' })}
            className="btn-outline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
