import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animalService } from '../services/animalService'
import { useAuth } from '../context/AuthContext'
import AnimalCard from '../components/animals/AnimalCard'

export default function BrowseAnimals() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', urgency: '' })

  useEffect(() => {
    fetchAnimals()
  }, [filters])

  const fetchAnimals = async () => {
    setLoading(true)
    try {
      const response = await animalService.getAll({
        type: filters.type || undefined,
        urgency: filters.urgency || undefined
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
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Find a Furry Friend</h1>
          <p className="text-gray-600 text-lg">
            Browse through our list of rescues and strays looking for a forever home. 
            Use filters to find specific breeds or urgent cases.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <select 
            className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 cursor-pointer"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Species</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="other">Others</option>
          </select>
          <div className="w-[1px] h-6 bg-gray-200 hidden sm:block"></div>
          <select 
            className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 cursor-pointer"
            value={filters.urgency}
            onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
          >
            <option value="">All Urgency Levels</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Urgency</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        {user?.role !== 'admin' && (
          <Link 
            to="/add-animal" 
            className="btn-primary flex items-center gap-2 px-8 py-4 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-xl">+</span>
            <span>Post New Animal</span>
          </Link>
        )}
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
            onClick={() => setFilters({ type: '', urgency: '' })}
            className="btn-outline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
