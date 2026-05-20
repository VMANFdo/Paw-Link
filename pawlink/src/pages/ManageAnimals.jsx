import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { animalService } from '../services/animalService'
import AnimalCard from '../components/animals/AnimalCard'
import AnimalForm from '../components/animals/AnimalForm'

export default function ManageAnimals() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [activeTab, setActiveTab] = useState('available')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchMyAnimals()
  }, [])

  const fetchMyAnimals = async () => {
    setLoading(true)
    try {
      const response = await animalService.getMyAnimals()
      setAnimals(response.data.data.animals)
    } catch (err) {
      console.error('Failed to fetch my animals:', err)
    } finally {
      setLoading(false)
    }
  }



  const filteredAnimals = animals.filter(animal => 
    (filterType === '' || animal.type === filterType) &&
    (activeTab === 'available' ? (animal.status === 'available' || animal.status === 'pending') : (animal.status === 'adopted' || animal.status === 'rescued'))
  )

  return (
    <div className="container py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div className="max-w-xl">
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Manage <span className="text-primary-600">Your Animals</span> 🐾
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            View and manage the animals you have posted for adoption or rescue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-wrap items-center bg-white p-2 rounded-3xl shadow-2xl shadow-primary-100/20 border border-gray-100">
            <div className="flex items-center gap-2 px-4 py-2 hover:bg-primary-50 rounded-2xl transition-all cursor-pointer group relative">
              <span className="text-xl group-hover:rotate-12 transition-transform">🐾</span>
              <select 
                className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm cursor-pointer min-w-[120px] appearance-none pr-8 relative z-10"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-2xl">+</span>
            Post Animal
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1 rounded-full flex gap-1">
          <button 
            onClick={() => setActiveTab('available')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              activeTab === 'available' ? 'bg-white shadow-md text-primary-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Available Animals
          </button>
          <button 
            onClick={() => setActiveTab('adopted')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              activeTab === 'adopted' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Adopted Animals
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 animate-pulse h-96 rounded-3xl"></div>
          ))}
        </div>
      ) : filteredAnimals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAnimals.map(animal => (
            <AnimalCard 
              key={animal.id} 
              animal={animal} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No animals found</h2>
          <p className="text-gray-500 mb-8">You haven't posted any animals yet or none match your filter.</p>
          {filterType !== '' && (
            <button 
              onClick={() => setFilterType('')}
              className="btn-outline"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto p-10 relative z-10 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900">Post New Animal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <AnimalForm onSuccess={() => { setShowModal(false); fetchMyAnimals(); }} />
          </div>
        </div>
      )}
    </div>
  )
}
