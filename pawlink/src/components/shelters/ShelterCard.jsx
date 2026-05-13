import { Link } from 'react-router-dom'
import CapacityBar from './CapacityBar'
import VerifiedBadge from './VerifiedBadge'

export default function ShelterCard({ shelter }) {
  return (
    <div className="card group overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
        {shelter.logo_url ? (
          <img 
            src={shelter.logo_url} 
            alt={shelter.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">🏢</div>
        )}
        {shelter.verified && (
          <div className="absolute top-4 right-4">
            <VerifiedBadge />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
            {shelter.name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
          <span className="text-lg">📍</span> {shelter.address.split(',')[0]}
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(shelter.animal_types || []).map(type => (
              <span key={type} className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                {type}s
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 bg-gray-50 p-3 rounded-xl">
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
            className="block w-full text-center py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
