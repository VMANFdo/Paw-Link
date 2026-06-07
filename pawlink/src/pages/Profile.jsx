import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import organizationService from '../services/organizationService'

/**
 * Profile.jsx — User Profile Page
 * Route: /profile
 * Access: Private
 */
export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', bio: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [orgProfile, setOrgProfile] = useState(null)
  const [orgMessage, setOrgMessage] = useState({ type: '', text: '' })
  const [orgLogoFile, setOrgLogoFile] = useState(null)
  const [orgLogoPreview, setOrgLogoPreview] = useState(null)
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    description: '',
    contact_number: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    website: '',
    max_capacity: '',
    animal_types: []
  })
  const orgLogoInputRef = useRef(null)
  const animalTypes = ['dog', 'cat', 'bird', 'rabbit', 'other']

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

      if (userData.role === 'organization') {
        try {
          const orgResponse = await organizationService.getMyProfile()
          const orgData = orgResponse.data.data.organization
          setOrgProfile(orgData)
          setOrgFormData(mapOrgToFormData(orgData))
        } catch (orgErr) {
          console.error('Failed to fetch shelter profile:', orgErr)
          setOrgMessage({ type: 'error', text: 'Failed to load shelter profile details.' })
        }
      }
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

  const handleOrgInputChange = (e) => {
    setOrgFormData({ ...orgFormData, [e.target.name]: e.target.value })
  }

  const handleOrgTypeToggle = (type) => {
    const selectedTypes = orgFormData.animal_types || []
    setOrgFormData({
      ...orgFormData,
      animal_types: selectedTypes.includes(type)
        ? selectedTypes.filter(item => item !== type)
        : [...selectedTypes, type]
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleOrgLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setOrgLogoFile(file)
      setOrgLogoPreview(URL.createObjectURL(file))
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const triggerOrgLogoInput = () => {
    orgLogoInputRef.current.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    const uploadData = new FormData()
    uploadData.append('name', formData.name)
    uploadData.append('bio', formData.bio)
    uploadData.append('phone', formData.phone)
    if (selectedFile) {
      uploadData.append('profile_picture', selectedFile)
    }

    try {
      const response = await userService.updateProfile(uploadData)
      const updatedUser = response.data.data.user
      setProfile(updatedUser)
      updateUser({ ...user, ...updatedUser }) // Preserve organization gate fields in global auth state.

      if (profile.role === 'organization' && orgProfile) {
        const orgUploadData = new FormData()
        Object.entries(orgFormData).forEach(([key, value]) => {
          if (key === 'animal_types') {
            orgUploadData.append(key, JSON.stringify(value || []))
          } else {
            orgUploadData.append(key, value ?? '')
          }
        })
        if (orgLogoFile) {
          orgUploadData.append('logo', orgLogoFile)
        }

        const orgResponse = await organizationService.updateProfile(orgUploadData)
        const updatedOrganization = orgResponse.data.data.organization
        setOrgProfile(updatedOrganization)
        setOrgFormData(mapOrgToFormData(updatedOrganization))
        setOrgLogoFile(null)
        setOrgLogoPreview(null)
        setOrgMessage({ type: '', text: '' })
      }

      setSelectedFile(null)
      setPreviewUrl(null)
      setIsEditing(false)
      setMessage({ type: 'success', text: profile.role === 'organization' ? 'Profile and shelter details updated successfully!' : 'Profile updated successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setFormData({ name: profile.name, bio: profile.bio || '', phone: profile.phone || '' })
    setOrgFormData(mapOrgToFormData(orgProfile))
    setSelectedFile(null)
    setPreviewUrl(null)
    setOrgLogoFile(null)
    setOrgLogoPreview(null)
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
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
        <div 
          onClick={isEditing ? triggerFileInput : undefined}
          className={`w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-4xl font-black text-primary-600 shadow-inner flex-shrink-0 relative group overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            profile.name.charAt(0).toUpperCase()
          )}
          
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">Change Photo</span>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{profile.name}</h1>
              <span className="inline-block bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
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
                onClick={cancelEditing}
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
          message.type === 'success' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Content */}
      <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        {!isEditing ? (
          /* --- VIEW MODE --- */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoBlock label="Full Name" value={profile.name} icon="👤" />
              <InfoBlock label="Email Address" value={profile.email} icon="✉️" readOnlyNotice="Cannot be changed" />
              <InfoBlock label="Phone Number" value={profile.phone || 'Not provided'} icon="📱" />
              <InfoBlock label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} icon="📅" readOnlyNotice="Cannot be changed" />
            </div>
            
            <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
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
          <form id="profile-edit-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
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
                  className="input-field bg-gray-50 dark:bg-dark-900 text-gray-400 dark:text-gray-500 cursor-not-allowed" 
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
                  placeholder="Ex: 071 012 3456"
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

            {profile.role !== 'organization' && (
            <div className="pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary px-10 py-4 shadow-lg w-full md:w-auto"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
            )}
          </form>
        )}
      </div>

      {profile.role === 'organization' && orgProfile && (
        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12 mt-10">
          <div className="flex flex-col md:flex-row md:items-start gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div 
              onClick={isEditing ? triggerOrgLogoInput : undefined}
              className={`w-full md:w-48 aspect-[16/10] rounded-3xl bg-secondary-50 dark:bg-secondary-950/30 flex items-center justify-center text-4xl font-black text-secondary-600 shadow-inner flex-shrink-0 relative group overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
            >
              {orgLogoPreview ? (
                <img src={orgLogoPreview} alt="Shelter logo preview" className="w-full h-full object-cover" />
              ) : orgProfile.logo_url ? (
                <img src={orgProfile.logo_url} alt={orgProfile.name} className="w-full h-full object-cover" />
              ) : (
                orgProfile.name?.charAt(0)?.toUpperCase() || 'S'
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">Change Shelter Photo</span>
                </div>
              )}
              
              <input 
                type="file" 
                ref={orgLogoInputRef} 
                onChange={handleOrgLogoChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Shelter Profile</h2>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This image is shown on shelter cards and public shelter pages.</p>
                </div>
              </div>
            </div>
          </div>

          {orgMessage.text && (
            <div className={`p-4 mb-8 rounded-2xl text-center font-bold text-sm ${
              orgMessage.type === 'success' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
            }`}>
              {orgMessage.text}
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoBlock label="Shelter Name" value={orgProfile.name} icon="Name" />
                <InfoBlock label="Contact Number" value={orgProfile.contact_number || 'Not provided'} icon="Phone" />
                <InfoBlock label="City" value={orgProfile.city || 'Not provided'} icon="City" />
                <InfoBlock label="Capacity" value={`${orgProfile.current_occupancy || 0} / ${orgProfile.max_capacity || 0}`} icon="Capacity" />
                <InfoBlock label="Website" value={orgProfile.website || 'Not provided'} icon="Web" />
                <InfoBlock label="Address" value={orgProfile.address || 'Not provided'} icon="Address" />
              </div>

              <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                <InfoBlock label="Description" value={orgProfile.description || 'No description provided yet.'} icon="About" fullWidth />
              </div>

              <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Animal Types Accepted</p>
                <div className="flex flex-wrap gap-2">
                  {(orgProfile.animal_types || []).length > 0 ? orgProfile.animal_types.map(type => (
                    <span key={type} className="text-xs font-black uppercase tracking-wider bg-gray-100 dark:bg-dark-900 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg">
                      {type}s
                    </span>
                  )) : (
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="form-label">Shelter Name</label>
                  <input type="text" name="name" value={orgFormData.name} onChange={handleOrgInputChange} className="input-field" required />
                </div>

                <div>
                  <label className="form-label">Contact Number</label>
                  <input type="tel" name="contact_number" value={orgFormData.contact_number} onChange={handleOrgInputChange} className="input-field" required />
                </div>

                <div>
                  <label className="form-label">Website</label>
                  <input type="url" name="website" value={orgFormData.website} onChange={handleOrgInputChange} className="input-field" placeholder="https://..." />
                </div>

                <div>
                  <label className="form-label">Total Shelter Capacity</label>
                  <input type="number" name="max_capacity" value={orgFormData.max_capacity} onChange={handleOrgInputChange} className="input-field" required min="0" />
                </div>

                <div>
                  <label className="form-label">Latitude</label>
                  <input type="number" step="any" name="latitude" value={orgFormData.latitude} onChange={handleOrgInputChange} className="input-field" required />
                </div>

                <div>
                  <label className="form-label">Longitude</label>
                  <input type="number" step="any" name="longitude" value={orgFormData.longitude} onChange={handleOrgInputChange} className="input-field" required />
                </div>

                <div>
                  <label className="form-label">City / Town</label>
                  <input type="text" name="city" value={orgFormData.city} onChange={handleOrgInputChange} className="input-field" required />
                </div>

                <div>
                  <label className="form-label">Full Address</label>
                  <input type="text" name="address" value={orgFormData.address} onChange={handleOrgInputChange} className="input-field" required />
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea name="description" value={orgFormData.description} onChange={handleOrgInputChange} className="input-field min-h-[120px] pt-4" placeholder="Tell the community about your shelter..."></textarea>
              </div>

              <div>
                <label className="form-label block mb-3">Animal Types Accepted</label>
                <div className="flex flex-wrap gap-2">
                  {animalTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleOrgTypeToggle(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                        orgFormData.animal_types.includes(type)
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-dark-900 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-950'
                      }`}
                    >
                      {type}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditing && profile.role === 'organization' && (
        <div className="pt-8 flex justify-end">
          <button 
            type="submit" 
            form="profile-edit-form"
            disabled={saving}
            className="btn-primary px-10 py-4 shadow-lg w-full md:w-auto"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      )}

    </div>
  )
}

function mapOrgToFormData(org) {
  if (!org) {
    return {
      name: '',
      description: '',
      contact_number: '',
      address: '',
      city: '',
      latitude: '',
      longitude: '',
      website: '',
      max_capacity: '',
      animal_types: []
    }
  }

  return {
    name: org.name || '',
    description: org.description || '',
    contact_number: org.contact_number || '',
    address: org.address || '',
    city: org.city || '',
    latitude: org.latitude ?? '',
    longitude: org.longitude ?? '',
    website: org.website || '',
    max_capacity: org.max_capacity ?? '',
    animal_types: org.animal_types || []
  }
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
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  )
}
