import { Link } from 'react-router-dom'

export default function AnimalCard({ animal }) {
  // Use a default image if none is provided
  const imageUrl = animal.thumbnail 
    ? animal.thumbnail 
    : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'

  const urgencyColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  }

  return (
    <div className="card group overflow-hidden hover:shadow-2xl transition-all">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={animal.breed} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${urgencyColors[animal.rescue_urgency] || 'bg-gray-100 text-gray-700'}`}>
            {animal.rescue_urgency} Urgency
          </span>
        </div>
        {animal.status === 'pending' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
              Rescue Pending
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{animal.breed || animal.type}</h3>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded capitalize">
            {animal.type}
          </span>
        </div>
        
        {animal.city && (
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${animal.latitude},${animal.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider hover:text-primary-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {animal.city}
          </a>
        )}
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
          {animal.description || 'No description provided.'}
        </p>

        <div className="flex items-center text-xs text-gray-400 mb-6">
          <span className="flex items-center mr-4">
            <span className="mr-1">🎂</span> {animal.age || 'Unknown age'}
          </span>
          <span className="flex items-center">
            <span className="mr-1">⚧</span> {animal.gender}
          </span>
        </div>

        <Link 
          to={`/animals/${animal.id}`} 
          className="btn-primary w-full py-3 text-sm flex items-center justify-center group-hover:bg-primary-600"
        >
          View Details
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
