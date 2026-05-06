import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { animalService } from '../services/animalService'
import { useAuth } from '../context/AuthContext'

export default function AnimalDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    fetchAnimal()
  }, [id])

  const fetchAnimal = async () => {
    try {
      const response = await animalService.getById(id)
      setAnimal(response.data.data.animal)
    } catch (err) {
      console.error('Failed to fetch animal details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdoptClick = () => {
    if (!user) {
      // Redirect to login but remember where they wanted to go
      navigate('/login', { state: { from: { pathname: `/animals/${id}` } } })
    } else {
      // Logic for opening adoption modal/form will go here in Phase 6
      alert('Adoption request form coming soon!')
    }
  }

  if (loading) return (
    <div className="container py-20 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-[3rem] mb-8"></div>
      <div className="h-10 bg-gray-200 w-1/3 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 w-2/3 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
    </div>
  )

  if (!animal) return (
    <div className="container py-20 text-center">
      <h1 className="text-4xl font-bold">Animal not found</h1>
      <Link to="/animals" className="text-primary-600 underline mt-4 inline-block">Back to gallery</Link>
    </div>
  )

  const images = animal.images?.length > 0 
    ? animal.images.map(img => `http://localhost:5000${img.image_url}`)
    : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80']

  return (
    <div className="container py-12">
      <Link to="/animals" className="text-sm font-bold text-gray-400 hover:text-gray-900 mb-8 inline-flex items-center group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Gallery
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 mt-4">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-100">
            <img 
              src={images[activeImage]} 
              className="w-full h-full object-cover" 
              alt={animal.breed}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${
                  activeImage === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge-primary px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-primary-50 text-primary-600">
                {animal.type}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider ${
                animal.rescue_urgency === 'critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {animal.rescue_urgency} Urgency
              </span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 leading-tight mb-2">
              {animal.breed || animal.type}
            </h1>
            <p className="text-xl text-gray-400 font-medium">📍 Spotted in Colombo area</p>
          </div>

          <div className="grid grid-cols-3 gap-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="text-center">
              <div className="text-2xl mb-1">🎂</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Age</div>
              <div className="text-lg font-black text-gray-900">{animal.age || 'Unknown'}</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-2xl mb-1">⚧</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Gender</div>
              <div className="text-lg font-black text-gray-900 capitalize">{animal.gender}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🏥</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Status</div>
              <div className="text-lg font-black text-primary-600 capitalize">{animal.status}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-900">About this {animal.type}</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {animal.description || 'No detailed description provided for this animal.'}
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center text-white font-bold mr-4">
                {animal.poster_name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Posted by</p>
                <p className="text-lg font-black text-gray-900">{animal.poster_name}</p>
              </div>
            </div>
            <button className="text-primary-600 font-bold hover:underline">Contact Poster</button>
          </div>

          <button 
            onClick={handleAdoptClick}
            className="btn-primary w-full py-5 text-xl font-black rounded-[2rem] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
          >
            I want to Adopt {animal.breed || animal.type}
          </button>
        </div>
      </div>
    </div>
  )
}
