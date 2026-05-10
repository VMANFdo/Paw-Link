import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'

/**
 * Profile.jsx — User Profile Page
 * Route: /profile
 * Access: Private
 */
export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', bio: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userService.getMyProfile()
      const userData = response.data.data.user
      setProfile(userData)
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || ''
      })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setMessage({ type: 'error', text: 'Failed to load profile data.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      await userService.updateProfile(formData)
      // Update local profile state with new data
      setProfile({ ...profile, ...formData })
      setIsEditing(false)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-section py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="container-section py-12 max-w-4xl">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b border-gray-100">
        <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-black text-primary-600 shadow-inner flex-shrink-0">
          {profile.profile_picture ? (
            <img src={`${API_BASE}${profile.profile_picture}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            profile.name.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">{profile.name}</h1>
              <span className="inline-block bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {profile.role}
              </span>
            </div>
            
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn-secondary px-6 py-2 shadow-sm"
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setFormData({ name: profile.name, bio: profile.bio || '', phone: profile.phone || '' }) // Reset
                }}
                className="btn-outline px-6 py-2"
              >
                Cancel Editing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`p-4 mb-8 rounded-2xl text-center font-bold text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
        {!isEditing ? (
          /* --- VIEW MODE --- */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoBlock label="Full Name" value={profile.name} icon="👤" />
              <InfoBlock label="Email Address" value={profile.email} icon="✉️" readOnlyNotice="Cannot be changed" />
              <InfoBlock label="Phone Number" value={profile.phone || 'Not provided'} icon="📱" />
              <InfoBlock label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} icon="📅" readOnlyNotice="Cannot be changed" />
            </div>
            
            <div className="pt-6 border-t border-gray-50">
              <InfoBlock 
                label="Bio" 
                value={profile.bio || 'No bio provided yet.'} 
                icon="📝" 
                fullWidth 
              />
            </div>
          </div>
        ) : (
          /* --- EDIT MODE --- */
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                  className="input-field" 
                  required
                />
              </div>
              
              <div>
                <label className="form-label flex justify-between">
                  Email Address <span className="text-[10px] text-gray-400 font-normal">Read-only</span>
                </label>
                <input 
                  type="email" 
                  value={profile.email} 
                  className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" 
                  disabled 
                />
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleInputChange}
                  className="input-field" 
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Bio / About Me</label>
              <textarea 
                name="bio"
                value={formData.bio} 
                onChange={handleInputChange}
                className="input-field min-h-[120px] pt-4" 
                placeholder="Tell the community a bit about yourself and your experience with pets..."
              ></textarea>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary px-10 py-4 shadow-lg w-full md:w-auto"
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  )
}

function InfoBlock({ label, value, icon, readOnlyNotice, fullWidth }) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <div className="flex justify-between items-end mb-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span>{icon}</span> {label}
        </p>
        {readOnlyNotice && <span className="text-[9px] text-gray-300 uppercase font-bold">{readOnlyNotice}</span>}
      </div>
      <p className="text-lg font-bold text-gray-900 mt-2">{value}</p>
    </div>
  )
}
