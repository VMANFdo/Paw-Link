import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { shelterService } from '../services/shelterService'
import { rescueService } from '../services/rescueService'

/**
 * OrganizationDashboard.jsx — Organization Dashboard
 * Route: /org-dashboard
 * Access: Organization / Admin
 */
export default function OrganizationDashboard() {
  const { user } = useAuth()
  const [shelter, setShelter] = useState(null)
  const [animals, setAnimals] = useState([])
  const [rescues, setRescues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [shelterRes, animalsRes, rescuesRes] = await Promise.all([
        shelterService.getMe(),
        shelterService.getAnimals(),
        rescueService.getAll() // Shelters can see all requests to claim them
      ])
      setShelter(shelterRes.data.data.shelter)
      setAnimals(animalsRes.data.data.animals)
      setRescues(rescuesRes.data.data.requests)
    } catch (err) {
      console.error('Failed to fetch shelter data', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="container-section py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  )

  return (
    <div className="container-section py-10 space-y-10">
      
      {/* 1. Header & Shelter Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-black text-gray-900">{shelter?.org_name}</h1>
            {shelter?.verified && (
              <span className="bg-blue-500 text-white p-1 rounded-full text-[8px] flex items-center justify-center w-4 h-4" title="Verified Organization">✓</span>
            )}
          </div>
          <p className="text-gray-500 max-w-xl">
            📍 {shelter?.address || 'Location not set'} • <span className="text-primary-600 font-bold">{user?.email}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/profile" className="btn-secondary text-sm px-6">Edit Profile</Link>
          <Link to="/add-animal" className="btn-primary text-sm px-6">Post New Animal</Link>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard 
          label="Managed Animals" 
          value={animals.length} 
          icon="🐾" 
          color="text-primary-600 bg-primary-50" 
        />
        <DashboardCard 
          label="Pending Rescue Cases" 
          value={rescues.filter(r => r.status === 'pending').length} 
          icon="🚨" 
          color="text-red-600 bg-red-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* 3. Managed Animals List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 px-2">Organization Animals</h2>
          <div className="space-y-4">
            {animals.length > 0 ? (
              animals.slice(0, 5).map(animal => (
                <AnimalRow key={animal.id} animal={animal} />
              ))
            ) : (
              <div className="card p-10 text-center text-gray-400">No animals currently managed.</div>
            )}
            {animals.length > 5 && (
              <button className="text-center w-full text-sm font-bold text-gray-400 hover:text-primary-600 py-2">View all managed animals</button>
            )}
          </div>
        </div>

        {/* 4. Urgent Rescues List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 px-2">Active Rescue Requests</h2>
          <div className="card divide-y divide-gray-50">
            {rescues.length > 0 ? (
              rescues.slice(0, 5).map(rescue => (
                <div key={rescue.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        rescue.rescue_urgency === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {rescue.rescue_urgency}
                      </span>
                      <p className="text-sm font-bold text-gray-800">{rescue.type} ({rescue.breed})</p>
                    </div>
                    <p className="text-xs text-gray-400">Reported by {rescue.reporter_name}</p>
                  </div>
                  <Link to={`/rescues`} className="text-xs font-bold text-primary-600 hover:underline">Take Action</Link>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400">No active rescue requests.</div>
            )}
          </div>
          <Link to="/rescues" className="block text-center text-sm font-bold text-primary-600 hover:underline py-2">
            Browse all rescue cases on map
          </Link>
        </div>

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
