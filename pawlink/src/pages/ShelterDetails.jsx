import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import organizationService from '../services/organizationService'
import CapacityBar from '../components/shelters/CapacityBar'
import VerifiedBadge from '../components/shelters/VerifiedBadge'
import HandoverForm from '../components/shelters/HandoverForm'

export default function ShelterDetails() {
  const { id } = useParams()
  const [shelter, setShelter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [handoverSuccess, setHandoverSuccess] = useState(false)

  useEffect(() => {
    organizationService.getPublicProfile(id)
      .then(res => setShelter(res.data.data.organization))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!shelter) return (
    <div className="container py-24 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Shelter not found</h2>
      <Link to="/shelters" className="text-primary-600 font-bold hover:underline mt-4 block">Back to listings</Link>
    </div>
  )

  return (
    <div className="container py-12">
      {handoverSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl mb-8 animate-fade-in-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <p className="font-bold">Handover request sent successfully! The shelter will review it soon.</p>
          </div>
          <button onClick={() => setHandoverSuccess(false)} className="text-green-900 font-black">✕</button>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden bg-gray-100 flex-shrink-0">
          {shelter.logo_url ? (
            <img src={shelter.logo_url} alt={shelter.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🏢</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900">{shelter.name}</h1>
            {shelter.verified && <VerifiedBadge />}
          </div>
          <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
            📍 {shelter.address}
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={`tel:${shelter.contact_number}`} className="btn-primary px-6 py-2 rounded-xl text-sm">Contact Shelter</a>
            <button 
              onClick={() => setShowHandoverModal(true)}
              className="bg-secondary-500 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-secondary-600 transition-colors"
            >
              Request Handover
            </button>
          </div>
        </div>
        <div className="w-full md:w-64">
           <CapacityBar current={shelter.current_occupancy} max={shelter.max_capacity} />
        </div>
      </div>

      {showHandoverModal && (
        <HandoverForm 
          organizationId={shelter.id} 
          orgName={shelter.name} 
          onClose={() => setShowHandoverModal(false)}
          onSuccess={() => {
            setShowHandoverModal(false)
            setHandoverSuccess(true)
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Shelter</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{shelter.description || 'No description provided.'}</p>
          </section>

          {/* Animals */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Animals at this Shelter</h2>
            {shelter.animals?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {shelter.animals.map(animal => (
                  <Link key={animal.id} to={`/animals/${animal.id}`} className="group card overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      {animal.thumbnail ? (
                        <img src={animal.thumbnail} alt={animal.breed} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">🐾</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">{animal.breed || animal.type}</h3>
                      <p className="text-xs text-gray-500">{animal.age} • {animal.gender}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No animals currently listed for adoption.</p>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Quick Info</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-gray-500">Website</span>
                <a href={shelter.website} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{shelter.website || 'N/A'}</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Accepts</span>
                <span className="text-gray-900 capitalize">{(shelter.animal_types || []).join(', ') || 'Any'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
