import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { rescueService } from '../services/rescueService'

/**
 * RescueRequests.jsx — Rescue Case Management
 * Features browsing all active cases and tracking user's own reports.
 */
export default function RescueRequests() {
  const { user } = useAuth()
  const [tab, setTab] = useState('all') // 'all' or 'mine'
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [tab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = tab === 'mine' 
        ? await rescueService.getMyRescues() 
        : await rescueService.getAll()
      setRequests(res.data.data.requests)
    } catch (err) {
      console.error('Failed to fetch rescues', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-section py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Rescue Operations</h1>
          <p className="text-gray-500 text-sm mt-1">Coordinate and track urgent animal rescue cases.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          <TabButton active={tab === 'all'} onClick={() => setTab('all')} label="All Cases" />
          <TabButton active={tab === 'mine'} onClick={() => setTab('mine')} label="My Reports" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length > 0 ? (
            requests.map(req => (
              <RescueCard key={req.id} rescue={req} showReporter={tab === 'all'} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center card bg-gray-50 border-dashed border-2">
              <p className="text-gray-400 font-medium">No rescue cases found.</p>
              <Link to="/map" className="text-primary-600 font-bold text-sm mt-2 inline-block">View cases on map</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
    </button>
  )
}

function RescueCard({ rescue, showReporter }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  const urgencyColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-500 text-white shadow-lg shadow-red-200'
  }

  return (
    <div className="card group hover:shadow-xl transition-all duration-300 border-b-4 border-b-primary-500 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {rescue.thumbnail ? (
          <img src={`${API_BASE}${rescue.thumbnail}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="rescue" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Photo</div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${urgencyColors[rescue.rescue_urgency]}`}>
            {rescue.rescue_urgency}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 shadow-sm">
            {rescue.status}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-grow">
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-1">{rescue.breed || rescue.type}</h3>
          <p className="text-xs text-gray-400 flex items-center">
            📍 {rescue.latitude.toFixed(4)}, {rescue.longitude.toFixed(4)}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl">
          <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-3">
            "{rescue.notes || 'No extra notes provided'}"
          </p>
        </div>

        {showReporter && (
          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase">
            <span className="mr-2">Reported by</span>
            <span className="text-primary-600">{rescue.reporter_name}</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-50 flex gap-2">
        <Link 
          to={`/animals/${rescue.animal_id}`} 
          className="flex-1 text-center py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors"
        >
          View Full Case
        </Link>
        <button className="px-4 py-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        </button>
      </div>
    </div>
  )
}
