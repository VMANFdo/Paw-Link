import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import organizationService from '../services/organizationService'
import handoverService from '../services/handoverService'
import CapacityBar from '../components/shelters/CapacityBar'
import VerifiedBadge from '../components/shelters/VerifiedBadge'

/**
 * OrganizationDashboard.jsx — Organization Dashboard
 * Route: /org-dashboard
 * Access: Organization / Admin
 */
export default function OrganizationDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('handovers') // Handovers is priority for orgs
  const [data, setData] = useState({
    profile: null,
    stats: null,
    handovers: [],
    animals: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [profileRes, statsRes, handoversRes] = await Promise.all([
        organizationService.getMyProfile(),
        organizationService.getMyStats(),
        handoverService.getReceivedRequests()
      ])

      setData({
        profile: profileRes.data.data.organization,
        stats: statsRes.data.data,
        handovers: handoversRes.data.data.requests,
        animals: profileRes.data.data.organization.animals || []
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
      if (err.response?.status === 404) {
        // If profile doesn't exist yet, redirect to setup
        navigate('/org-setup')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleHandoverStatus = async (id, status) => {
    try {
      await handoverService.updateStatus(id, { status })
      fetchDashboardData() // Refresh
    } catch (err) {
      alert('Failed to update status')
    }
  }

  if (loading) return (
    <div className="container py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
    </div>
  )

  const { profile, stats, handovers, animals } = data

  // 1. GATE: Check if profile is approved
  if (profile && profile.status !== 'approved') {
    return (
      <div className="container py-24 text-center max-w-2xl">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
           <div className="text-6xl mb-6">
             {profile.status === 'pending' ? '⏳' : 
              profile.status === 'rejected' ? '❌' : '📂'}
           </div>
           <h1 className="text-3xl font-black text-gray-900 mb-4">
             {profile.status === 'pending' ? 'Application Under Review' : 
              profile.status === 'rejected' ? 'Application Rejected' : 'More Documents Needed'}
           </h1>
           <p className="text-gray-500 text-lg mb-8">
             {profile.status === 'pending' ? 
              "We've received your shelter setup details. Our team is currently reviewing your application to ensure platform safety." : 
              profile.status === 'rejected' ? 
              "Unfortunately, your organization doesn't meet our current requirements for verified shelters." : 
              "The admin has requested additional documentation to verify your organization."}
           </p>
           
           <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left mb-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Next Steps</h3>
              <p className="text-sm text-gray-600">
                {profile.status === 'pending' ? 
                 "You'll be able to manage animals and receive handovers once an administrator approves your profile. Please check back later." : 
                 profile.status === 'rejected' ? 
                 "If you believe this is a mistake, please contact support@pawlink.com." : 
                 "Please check your email for specific instructions on what documents are required."}
              </p>
           </div>

           <div className="flex justify-center gap-4">
             <Link to="/org-setup" className="btn-secondary px-6 py-2">Update Profile</Link>
             <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2">Check Status</button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-8">
      
      {/* 1. Header & Shelter Info */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100">
            {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover rounded-2xl" /> : '🏢'}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-gray-900">{profile?.name || 'Organization Name'}</h1>
              {profile?.verified && <VerifiedBadge />}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-4">
              📍 {profile?.address || 'Location not set'}
            </p>
            <div className="flex gap-2">
              <Link to="/org-setup" className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors">Edit Profile</Link>
              <Link to="/add-animal" className="text-xs font-bold text-white bg-gray-900 px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors">+ Post Animal</Link>
            </div>
          </div>
        </div>
        <div className="md:w-64 flex-shrink-0 pt-4">
           <CapacityBar current={stats?.capacity?.current} max={stats?.capacity?.total} />
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'handovers', label: 'Handover Requests', count: handovers.filter(h => h.status === 'pending').length },
          { id: 'animals', label: 'Managed Animals', count: animals.length },
          { id: 'rescues', label: 'Urgent Rescues' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-black transition-all border-b-2 relative ${
              activeTab === tab.id 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'handovers' && (
          <div className="space-y-4 animate-fade-in">
            {handovers.length > 0 ? (
              handovers.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary-50 text-primary-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        {req.animal_type}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        req.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                        req.status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-gray-900 font-bold mb-1">{req.description}</p>
                    <p className="text-gray-400 text-xs">Request by <span className="font-bold">{req.user_name}</span> • {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  {req.status === 'pending' && (
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => handleHandoverStatus(req.id, 'accepted')}
                        className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleHandoverStatus(req.id, 'rejected')}
                        className="bg-gray-100 text-gray-500 text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No handover requests received.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'animals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             {animals.length > 0 ? (
               animals.map(animal => (
                 <div key={animal.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                      {animal.thumbnail && <img src={animal.thumbnail} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{animal.breed || animal.type}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          animal.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {animal.status}
                        </span>
                      </div>
                    </div>
                    <Link to={`/animals/${animal.id}`} className="text-gray-300 hover:text-primary-500">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </Link>
                 </div>
               ))
             ) : (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No animals currently managed.</p>
                </div>
             )}
          </div>
        )}

        {activeTab === 'rescues' && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in">
             <p className="text-gray-400 font-medium italic">Rescue cases integration coming soon.</p>
             <Link to="/map" className="text-primary-600 font-bold text-sm mt-4 inline-block hover:underline">View Map for Active Rescues</Link>
          </div>
        )}
      </div>

    </div>
  )
}

function DashboardCard({ label, value, icon, color }) {
  return (
    <div className="card p-8 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-gray-900">{value}</p>
      </div>
      <div className={`w-16 h-16 rounded-3xl ${color} flex items-center justify-center text-3xl shadow-sm`}>
        {icon}
      </div>
    </div>
  )
}

function AnimalRow({ animal }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  return (
    <div className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
          {animal.thumbnail && (
            <img src={`${API_BASE}${animal.thumbnail}`} className="w-full h-full object-cover" alt="thumb" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-800">{animal.breed || animal.type}</h4>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
            animal.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {animal.status}
          </span>
        </div>
      </div>
      <Link to={`/animals/${animal.id}`} className="p-2 text-gray-400 hover:text-primary-500">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      </Link>
    </div>
  )
}
