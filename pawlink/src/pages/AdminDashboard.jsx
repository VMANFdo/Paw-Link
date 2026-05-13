import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'

/**
 * AdminDashboard.jsx — Master Platform Moderation
 * Tabs: Stats | Users | Animals | Reports
 */
export default function AdminDashboard() {
  const { user } = useAuth()
  const { showToast, confirm } = useUI()
  const [tab, setTab] = useState('stats')
  const [data, setData] = useState({ stats: null, users: [], animals: [], reports: [] })
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)

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
      showToast(`User ${currentStatus ? 'banned' : 'unbanned'} successfully`)
      fetchData()
    } catch (err) { showToast('Action failed', 'error') }
  }

  const handleDeleteAnimal = async (aId) => {
    const isConfirmed = await confirm({
      title: 'Delete Post?',
      message: 'Are you sure you want to delete this animal post forever? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      type: 'danger'
    })

    if (!isConfirmed) return

    try {
      await adminService.deleteAnimal(aId)
      showToast('Post deleted successfully')
      fetchData()
    } catch (err) { showToast('Delete failed', 'error') }
  }

  const handleCreateUser = async (userData) => {
    try {
      await adminService.createUser(userData)
      showToast('User created successfully')
      setShowUserModal(false)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create user', 'error')
    }
  }

  return (
    <div className="container-section py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Admin Control Panel</h1>
          <p className="text-gray-500 mt-1">Platform-wide moderation and analytics.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl overflow-x-auto">
          <TabBtn active={tab === 'stats'} onClick={() => setTab('stats')} label="Overview" />
          <TabBtn active={tab === 'users'} onClick={() => setTab('users')} label="Users" />
          <TabBtn active={tab === 'organizations'} onClick={() => setTab('organizations')} label="Shelters" />
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
          {tab === 'users' && (
            <div>
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => setShowUserModal(true)}
                  className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-primary-500/20"
                >
                  <span className="text-xl">+</span> Add New User
                </button>
              </div>
              <UsersTable users={data.users} onToggle={handleToggleUser} />
            </div>
          )}
          {tab === 'organizations' && <OrganizationsTable orgs={data.organizations} onUpdate={handleUpdateOrg} />}
          {tab === 'animals' && <AnimalsList animals={data.animals} onDelete={handleDeleteAnimal} />}
          {tab === 'reports' && <ReportsList reports={data.reports} />}
        </div>
      )}

      {showUserModal && (
        <AddUserModal 
          onClose={() => setShowUserModal(false)} 
          onSubmit={handleCreateUser} 
        />
      )}
    </div>
  )
}

function AddUserModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'person'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-scale-up overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900">Add New User</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all">&times;</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required 
                minLength="8"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 font-bold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">User Role</label>
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 font-bold appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="person">Person (Individual)</option>
                <option value="organization">Organization (Shelter)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
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

function OrganizationsTable({ orgs, onUpdate }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Organization</th>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Verification</th>
            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orgs?.map(o => (
            <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">{o.name}</p>
                <p className="text-xs text-gray-400">{o.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  o.status === 'approved' ? 'bg-green-50 text-green-700' : 
                  o.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                  o.status === 'more_docs_needed' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                }`}>
                  {o.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4">
                 <span className={`text-sm font-medium ${o.verified ? 'text-blue-600' : 'text-gray-400'}`}>
                   {o.verified ? 'Verified ✅' : 'Unverified'}
                 </span>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                {o.status !== 'approved' && (
                  <button 
                    onClick={() => onUpdate(o.id, 'approved')}
                    className="text-xs font-black uppercase text-green-600 hover:underline"
                  >
                    Approve
                  </button>
                )}
                {(o.status === 'pending' || o.status === 'approved') && (
                  <button 
                    onClick={() => onUpdate(o.id, 'more_docs_needed')}
                    className="text-xs font-black uppercase text-blue-600 hover:underline"
                  >
                    Need Docs
                  </button>
                )}
                {o.status !== 'rejected' && (
                  <button 
                    onClick={() => onUpdate(o.id, 'rejected')}
                    className="text-xs font-black uppercase text-red-500 hover:underline"
                  >
                    Reject
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
