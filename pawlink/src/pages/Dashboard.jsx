import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import { animalService } from '../services/animalService'
import { adoptionService } from '../services/adoptionService'
import handoverService from '../services/handoverService'

/**
 * Dashboard.jsx — User Dashboard
 * Route: /dashboard
 * Access: Private
 */
export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalPosts: 0, requestsSent: 0, requestsReceived: 0 })
  const [myAnimals, setMyAnimals] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [adoptedAnimals, setAdoptedAnimals] = useState([])
  const [myHandovers, setMyHandovers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, animalsRes, requestsRes, sentRes, handoversRes] = await Promise.all([
          userService.getStats(),
          animalService.getMyAnimals(),
          adoptionService.getReceived(),
          adoptionService.getMine(),
          handoverService.getMyRequests()
        ])
        setStats(statsRes.data.data)
        setMyAnimals(animalsRes.data.data.animals)
        setRecentRequests(requestsRes.data.data.requests.slice(0, 5)) // Show only top 5 recent
        const approved = sentRes.data.data.requests.filter(req => req.status === 'approved')
        setAdoptedAnimals(approved)
        setMyHandovers(handoversRes.data.data.requests)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="container-section py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="container-section py-10 space-y-10">
      
      {/* 1. Header & Stats */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back, <strong>{user?.name}</strong>!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Posts" value={stats.totalPosts} color="bg-blue-500" icon="🐾" />
          <StatCard label="Requests Sent" value={stats.requestsSent} color="bg-teal-500" icon="📩" />
          <StatCard label="Requests Received" value={stats.requestsReceived} color="bg-orange-500" icon="📥" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 2. My Recent Posts (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">My Animal Posts</h2>
            {user?.role !== 'admin' && (
              <Link to="/add-animal" className="text-sm font-bold text-primary-600 hover:underline">+ New Post</Link>
            )}
          </div>

          <div className="space-y-4">
            {myAnimals.length > 0 ? (
              myAnimals.slice(0, 4).map(animal => (
                <AnimalListItem key={animal.id} animal={animal} />
              ))
            ) : (
              <EmptyState message="You haven't posted any animals yet." />
            )}
            {myAnimals.length > 4 && (
              <Link to="/animals" className="block text-center text-sm font-bold text-gray-500 hover:text-primary-600 py-2">
                View all posts
              </Link>
            )}
          </div>

          {/* Handover Requests Sent */}
          <div className="pt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Handover Requests</h2>
            <div className="space-y-4">
              {myHandovers.length > 0 ? (
                myHandovers.map(req => (
                  <div key={req.id} className="card p-4 flex items-center justify-between border-l-4 border-secondary-500">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{req.description.slice(0, 50)}...</p>
                      <p className="text-[10px] text-gray-500 mt-1">To: <span className="font-bold">{req.organization_name}</span> • {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
                      req.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState message="No handover requests sent yet." />
              )}
            </div>
          </div>
        </div>

        {/* 3. Recent Adoption Requests (Right Column) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Requests</h2>
          <div className="card divide-y divide-gray-50">
            {recentRequests.length > 0 ? (
              recentRequests.map(req => (
                <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-800">{req.requester_name}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Applied for {req.type} ({req.breed})</p>
                  <Link to="/messages" state={{ defaultTab: 'requests' }} className="text-[11px] font-bold text-primary-600 hover:underline">View Details</Link>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-xs text-gray-400">No requests received yet.</p>
              </div>
            )}
          </div>
          <Link to="/messages" state={{ defaultTab: 'requests' }} className="btn-secondary w-full text-center text-sm py-2 block">
            Manage All Requests
          </Link>
        </div>

      </div>

      {/* 4. My Adopted Animals Section */}
      <div className="space-y-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">My Adopted Furry Friends 🐾</h2>
        </div>
        
        {adoptedAnimals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adoptedAnimals.map(req => (
              <AdoptedAnimalCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <EmptyState message="You haven't adopted any animals yet. Give a furry friend a forever home!" />
        )}
      </div>

    </div>
  )
}

// --- Helper Components ---

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card p-6 flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl shadow-lg shadow-${color}/20 text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function AnimalListItem({ animal }) {
  return (
    <div className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
          {animal.thumbnail ? (
            <img src={animal.thumbnail} alt={animal.breed} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{animal.breed || animal.type}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`badge-${animal.status}`}>{animal.status}</span>
            <span className="text-[10px] text-gray-400 font-medium">
              {animal.city ? `${animal.city} • ` : ''}
              {new Date(animal.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Link to={`/animals/${animal.id}`} className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        </Link>
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 border-dashed border-2">
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  )
}

function AdoptedAnimalCard({ request }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  return (
    <div className="card p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow border-2 border-green-100 bg-green-50/30">
      <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-3 border-4 border-white shadow-sm">
        {request.thumbnail ? (
          <img src={`${API_BASE}${request.thumbnail}`} alt={request.breed} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
        )}
      </div>
      <h4 className="font-black text-gray-900">{request.breed || request.type}</h4>
      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full mt-2 bg-green-500 text-white shadow-sm">
        Adopted
      </span>
      <Link to={`/animals/${request.animal_id}`} className="text-xs font-bold text-primary-600 hover:underline mt-4">
        View Post
      </Link>
    </div>
  )
}
