import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { useAuth } from '../context/AuthContext'

/**
 * AdminDashboard.jsx — Master Platform Moderation
 * Tabs: Stats | Users | Animals | Reports
 */
export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('stats')
  const [data, setData] = useState({ stats: null, users: [], animals: [], reports: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [tab])

  const fetchData = async () => {
    setLoading(true)
    try {
      let res
      switch(tab) {
        case 'stats':   res = await adminService.getStats(); setData(prev => ({...prev, stats: res.data.data.stats})); break;
        case 'users':   res = await adminService.getUsers(); setData(prev => ({...prev, users: res.data.data.users})); break;
        case 'animals': res = await adminService.getAnimals(); setData(prev => ({...prev, animals: res.data.data.animals})); break;
        case 'reports': res = await adminService.getReports(); setData(prev => ({...prev, reports: res.data.data.reports})); break;
        default: break;
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUser = async (uId, currentStatus) => {
    try {
      await adminService.updateUserStatus(uId, !currentStatus)
      fetchData() // Refresh list
    } catch (err) { alert('Action failed') }
  }

  const handleDeleteAnimal = async (aId) => {
    if (!window.confirm('Delete this animal post forever?')) return
    try {
      await adminService.deleteAnimal(aId)
      fetchData()
    } catch (err) { alert('Delete failed') }
  }

  return (
    <div className="container-section py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-500 mt-1">Platform-wide moderation and analytics.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <TabBtn active={tab === 'stats'} onClick={() => setTab('stats')} label="Overview" />
          <TabBtn active={tab === 'users'} onClick={() => setTab('users')} label="Users" />
          <TabBtn active={tab === 'animals'} onClick={() => setTab('animals')} label="Posts" />
          <TabBtn active={tab === 'reports'} onClick={() => setTab('reports')} label="Reports" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {tab === 'stats' && <StatsOverview stats={data.stats} />}
          {tab === 'users' && <UsersTable users={data.users} onToggle={handleToggleUser} />}
          {tab === 'animals' && <AnimalsList animals={data.animals} onDelete={handleDeleteAnimal} />}
          {tab === 'reports' && <ReportsList reports={data.reports} />}
        </div>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white shadow-md text-primary-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
    </button>
  )
}

function StatsOverview({ stats }) {
  if (!stats) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Users" value={stats.users} color="bg-blue-50 text-blue-600" />
      <StatCard label="Total Posts" value={stats.animals} color="bg-primary-50 text-primary-600" />
      <StatCard label="Successful Adoptions" value={stats.adoptions} color="bg-green-50 text-green-600" />
      <StatCard label="Active Rescues" value={stats.activeRescues} color="bg-red-50 text-red-600" />
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card p-8 flex flex-col items-center justify-center text-center">
      <span className={`text-5xl font-black mb-3 ${color.split(' ')[1]}`}>{value}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function UsersTable({ users, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">User</th>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Role</th>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  u.role === 'admin' ? 'bg-red-50 text-red-600' : 
                  u.role === 'organization' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium">{u.is_active ? 'Active' : 'Banned'}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onToggle(u.id, u.is_active)}
                  className={`text-xs font-black uppercase tracking-widest ${u.is_active ? 'text-red-500 hover:underline' : 'text-green-500 hover:underline'}`}
                >
                  {u.is_active ? 'Ban User' : 'Unban User'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnimalsList({ animals, onDelete }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {animals.map(a => (
        <div key={a.id} className="card p-4 flex flex-col">
          <div className="h-40 rounded-2xl bg-gray-100 overflow-hidden mb-4 relative">
             <img src={`${API_BASE}${a.thumbnail}`} className="w-full h-full object-cover" alt="animal" />
             <div className="absolute top-2 right-2">
               <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase">{a.status}</span>
             </div>
          </div>
          <div className="flex-grow">
            <h4 className="font-black text-gray-900">{a.breed || a.type}</h4>
            <p className="text-xs text-gray-400 mb-4">Posted by {a.poster_name}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1 text-[10px] py-2">Edit</button>
            <button onClick={() => onDelete(a.id)} className="btn-secondary flex-1 text-[10px] py-2 text-red-500 hover:bg-red-50 border-red-100">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportsList({ reports }) {
  return (
    <div className="card divide-y divide-gray-50">
      {reports.length > 0 ? reports.map(r => (
        <div key={r.id} className="p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{r.type || 'Flagged'}</span>
              <p className="text-sm font-black text-gray-900">Report #{r.id}</p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-1">{r.reason || r.description}</p>
            <p className="text-xs text-gray-400">Reporter: {r.reporter_name} • {new Date(r.created_at).toLocaleDateString()}</p>
          </div>
          <button className="text-xs font-black text-primary-600 hover:underline">Dismiss</button>
        </div>
      )) : (
        <div className="p-20 text-center text-gray-400">No active reports. All clear!</div>
      )}
    </div>
  )
}
