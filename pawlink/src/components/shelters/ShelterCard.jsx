import { useState } from 'react'
import { Link } from 'react-router-dom'
import CapacityBar from './CapacityBar'
import VerifiedBadge from './VerifiedBadge'

export default function ShelterCard({ shelter }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const getImageUrl = (logoUrl) => {
    if (!logoUrl) return null
    // If it's already a full URL, use it; otherwise prepend the API base
    if (logoUrl.startsWith('http')) return logoUrl
    return `http://localhost:5000${logoUrl}`
  }

  const renderImage = () => {
    const imageUrl = getImageUrl(shelter.logo_url)
    
    if (!imageUrl || imageError) {
      // Fallback: Show initials with gradient
      const initials = (shelter.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      const colors = ['bg-gradient-to-br from-primary-400 to-primary-600', 'bg-gradient-to-br from-secondary-400 to-secondary-600', 'bg-gradient-to-br from-cyan-400 to-cyan-600']
      const colorClass = colors[shelter.id % colors.length]
      
      return (
        <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${colorClass}`}>
          {initials}
        </div>
      )
    }

    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={imageUrl}
          alt={shelter.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      </>
    )
  }

  return (
    <div className="card group overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300">
      <div className="aspect-[16/9] relative overflow-hidden bg-gray-100 dark:bg-dark-900">
        {renderImage()}
        {shelter.verified && (
          <div className="absolute top-4 right-4">
            <VerifiedBadge />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            {shelter.name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1.5">
          <span className="text-lg">📍</span> {shelter.address.split(',')[0]}
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(shelter.animal_types || []).map(type => (
              <span key={type} className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-dark-900 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-md">
                {type}s
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-800 p-3 rounded-xl">
             <div className="flex items-center gap-1.5">
                <span>🐾</span>
                <span>{shelter.current_occupancy} Hosted</span>
             </div>
             <div className="flex items-center gap-1.5">
                <span>📞</span>
                <span>{shelter.contact_number || 'No contact'}</span>
             </div>
          </div>

          <CapacityBar current={shelter.current_occupancy} max={shelter.max_capacity} mini />
          
          <Link 
            to={`/shelters/${shelter.id}`} 
            className="block w-full text-center py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-600 dark:hover:text-white transition-colors shadow-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
