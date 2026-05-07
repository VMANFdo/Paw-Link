import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { animalService } from '../services/animalService'
import { adoptionService } from '../services/adoptionService'
import { useAuth } from '../context/AuthContext'

/**
 * AnimalDetails.jsx — Detailed view for a single animal
 * Features a gallery, detailed information, and adoption request flow.
 */
export default function AnimalDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [adoptionMessage, setAdoptionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

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
      navigate('/login', { state: { from: { pathname: `/animals/${id}` } } })
    } else {
      setShowModal(true)
    }
  }

  const handleSubmitAdoption = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adoptionService.create({ animal_id: id, message: adoptionMessage })
      setRequestSent(true)
      setTimeout(() => setShowModal(false), 2000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="container py-20 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-[3rem] mb-8"></div>
      <div className="h-10 bg-gray-200 w-1/3 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 w-2/3 rounded mb-2"></div>
    </div>
  )

  if (!animal) return (
    <div className="container py-20 text-center">
      <h1 className="text-4xl font-bold">Animal not found</h1>
      <Link to="/animals" className="text-primary-600 underline mt-4 inline-block">Back to gallery</Link>
    </div>
  )

  const images = animal.images?.length > 0 
    ? animal.images.map(img => `${API_BASE}${img.image_url}`)
    : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80']

  const isOwner = user?.id === animal.posted_by

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
              <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-primary-50 text-primary-600">
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
            <p className="text-xl text-gray-400 font-medium">📍 Located at {animal.latitude}, {animal.longitude}</p>
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
                {animal.poster_name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Posted by</p>
                <p className="text-lg font-black text-gray-900">{animal.poster_name}</p>
              </div>
            </div>
          </div>

          {!isOwner && animal.status === 'available' && (
            <button 
              onClick={handleAdoptClick}
              className="btn-primary w-full py-5 text-xl font-black rounded-[2rem] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
            >
              I want to Adopt {animal.breed || animal.type}
            </button>
          )}

          {isOwner && (
            <div className="p-4 bg-primary-50 rounded-2xl text-center text-primary-700 font-bold text-sm">
              This is your post. You can manage it from your dashboard.
            </div>
          )}
        </div>
      </div>

      {/* Adoption Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative z-10 shadow-2xl animate-fade-in-up">
            {!requestSent ? (
              <form onSubmit={handleSubmitAdoption} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Adoption Request</h2>
                  <p className="text-gray-500">Tell the poster why you'd like to adopt {animal.breed || animal.type}.</p>
                </div>
                <div>
                  <label className="form-label">Your Message</label>
                  <textarea 
                    className="input-field min-h-[150px] pt-3" 
                    placeholder="Describe your home environment, experience with pets, etc."
                    value={adoptionMessage}
                    onChange={(e) => setAdoptionMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1 py-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary flex-1 py-4"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Success!</h2>
                <p className="text-gray-500">Your adoption request has been sent to the poster.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
