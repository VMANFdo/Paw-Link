import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import organizationService from '../services/organizationService'
import { getShelterImage } from '../utils/defaultImages'

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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [orgMessage, setOrgMessage] = useState({ type: '', text: '' })
  
  // User profile fields
  const [formData, setFormData] = useState({ name: '', bio: '', phone: '' })
  const userProfileRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  // Organization profile (unified)
  const [orgProfile, setOrgProfile] = useState(null)
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
  const orgLogoRef = useRef(null)
  const [orgLogoFile, setOrgLogoFile] = useState(null)
  const [orgLogoPreview, setOrgLogoPreview] = useState(null)
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
    if (!file) return

    // Validation: File type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setOrgMessage({ 
        type: 'error', 
        text: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' 
      })
      e.target.value = ''
      return
    }

    // Validation: File size (5MB max)
    const maxSizeMB = 5
    if (file.size > maxSizeMB * 1024 * 1024) {
      setOrgMessage({ 
        type: 'error', 
        text: `File size exceeds ${maxSizeMB}MB limit.` 
      })
      e.target.value = ''
      return
    }

    setOrgMessage({ type: '', text: '' })
    setOrgLogoFile(file)
    setOrgLogoPreview(URL.createObjectURL(file))
  }

  const triggerUserProfileInput = () => {
    userProfileRef.current.click()
  }

  const triggerOrgLogoInput = () => {
    orgLogoRef.current.click()
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
      // For organization users, update both user and org data
      // For organization users, update both user and org data in parallel
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

        try {
          // Update org profile (shelter details + logo)
          const orgResponse = await organizationService.updateProfile(orgUploadData)
          const updatedOrganization = orgResponse.data.data.organization
          setOrgProfile(updatedOrganization)
          setOrgFormData(mapOrgToFormData(updatedOrganization))
          setOrgLogoFile(null)
          // Update preview with the actual server response
          if (updatedOrganization.logo_url) {
            const logoUrl = updatedOrganization.logo_url.startsWith('http') 
              ? updatedOrganization.logo_url 
              : `http://localhost:5000${updatedOrganization.logo_url}`
            setOrgLogoPreview(logoUrl)
          } else {
            setOrgLogoPreview(null)
          }
        } catch (orgErr) {
          setOrgMessage({ 
            type: 'error', 
            text: orgErr.response?.data?.message || 'Failed to update shelter profile.' 
          })
          setSaving(false)
          return
        }
      }

      // Update user profile (name, bio, phone) - always happens
      const userResponse = await userService.updateProfile(uploadData)
      const updatedUser = userResponse.data.data.user
      setProfile(updatedUser)
      updateUser({ ...user, ...updatedUser })

      setSelectedFile(null)
      setPreviewUrl(null)
      setIsEditing(false)
      setMessage({ type: 'success', text: profile.role === 'organization' ? 'Shelter profile updated successfully!' : 'Profile updated successfully!' })
      
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
          onClick={isEditing && profile.role !== 'organization' ? triggerUserProfileInput : undefined}
          className={`w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-4xl font-black text-primary-600 shadow-inner flex-shrink-0 relative group overflow-hidden ${isEditing && profile.role !== 'organization' ? 'cursor-pointer' : ''}`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            profile.name.charAt(0).toUpperCase()
          )}
          
          {isEditing && profile.role !== 'organization' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">Change Photo</span>
            </div>
          )}
          
          <input 
            type="file" 
            ref={userProfileRef} 
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
                {profile.role === 'organization' ? 'Shelter' : profile.role}
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

      {/* REGULAR USER PROFILE */}
      {profile.role !== 'organization' && (
        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
          {!isEditing ? (
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
                  placeholder="Tell the community a bit about yourself..."
                ></textarea>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary px-10 py-4 shadow-lg w-full md:w-auto"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* UNIFIED ORGANIZATION PROFILE */}
      {profile.role === 'organization' && orgProfile && (
        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
          {!isEditing ? (
            /* --- VIEW MODE --- */
            <div className="space-y-8">
              {/* Logo Display */}
              <div className="flex flex-col md:flex-row md:items-start gap-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div className="w-full md:w-48 aspect-[16/10] rounded-3xl bg-secondary-50 dark:bg-secondary-950/30 flex items-center justify-center text-4xl font-black text-secondary-600 shadow-inner flex-shrink-0 overflow-hidden">
                  <img
                    src={getShelterImage(orgProfile.logo_url)}
                    alt={orgProfile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getShelterImage()
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Shelter Profile Picture</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This image is displayed on shelter cards and public pages.</p>
                </div>
              </div>

              {/* Shelter Details */}
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoBlock label="Shelter Name" value={orgProfile.name} icon="🏠" />
                  <InfoBlock label="Contact Number" value={orgProfile.contact_number || 'Not provided'} icon="📞" />
                  <InfoBlock label="Email" value={profile.email} icon="✉️" />
                  <InfoBlock label="Website" value={orgProfile.website || 'Not provided'} icon="🌐" />
                </div>
              </div>

              {/* Location */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoBlock label="City" value={orgProfile.city || 'Not provided'} icon="🗺️" />
                  <InfoBlock label="Address" value={orgProfile.address || 'Not provided'} icon="📍" fullWidth />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoBlock label="Latitude" value={orgProfile.latitude || 'N/A'} icon="↕️" />
                    <InfoBlock label="Longitude" value={orgProfile.longitude || 'N/A'} icon="↔️" />
                  </div>
                </div>
              </div>

              {/* Operations */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Operations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoBlock label="Total Capacity" value={orgProfile.max_capacity || '0'} icon="🐾" />
                  <InfoBlock label="Current Occupancy" value={orgProfile.current_occupancy || '0'} icon="🐕" />
                </div>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">About</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{orgProfile.description || 'No description provided yet.'}</p>
              </div>

              {/* Animal Types */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Animal Types Accepted</h3>
                <div className="flex flex-wrap gap-2">
                  {(orgProfile.animal_types || []).length > 0 ? orgProfile.animal_types.map(type => (
                    <span key={type} className="text-xs font-black uppercase tracking-wider bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg">
                      {type}s
                    </span>
                  )) : (
                    <span className="text-gray-500 dark:text-gray-400">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- EDIT MODE --- */
            <form id="profile-edit-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
              {/* Logo Upload Section */}
              <div className="flex flex-col md:flex-row md:items-start gap-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                <div 
                  onClick={triggerOrgLogoInput}
                  className="w-full md:w-48 aspect-[16/10] rounded-3xl bg-secondary-50 dark:bg-secondary-950/30 flex items-center justify-center text-4xl font-black text-secondary-600 shadow-inner flex-shrink-0 cursor-pointer relative group overflow-hidden"
                >
                  <img
                    src={orgLogoPreview || getShelterImage(orgProfile.logo_url)}
                    alt={orgLogoPreview ? 'Shelter logo preview' : orgProfile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getShelterImage()
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold text-center px-2">Click to change photo</span>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={orgLogoRef} 
                    onChange={handleOrgLogoChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Shelter Profile Picture</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload an image that represents your shelter. This will be shown on shelter cards and public pages.</p>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Formats: JPG, PNG, WebP • Max size: 5MB</div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Shelter Name</label>
                    <input type="text" name="name" value={orgFormData.name} onChange={handleOrgInputChange} className="input-field" required />
                  </div>

                  <div>
                    <label className="form-label">Contact Number</label>
                    <input type="tel" name="contact_number" value={orgFormData.contact_number} onChange={handleOrgInputChange} className="input-field" required />
                  </div>

                  <div className="md:col-span-2">
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
                    <label className="form-label">Website (Optional)</label>
                    <input type="url" name="website" value={orgFormData.website} onChange={handleOrgInputChange} className="input-field" placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">City / Town</label>
                    <input type="text" name="city" value={orgFormData.city} onChange={handleOrgInputChange} className="input-field" required />
                  </div>

                  <div>
                    <label className="form-label">Full Address</label>
                    <input type="text" name="address" value={orgFormData.address} onChange={handleOrgInputChange} className="input-field" required />
                  </div>

                  <div>
                    <label className="form-label">Latitude</label>
                    <input type="number" step="any" name="latitude" value={orgFormData.latitude} onChange={handleOrgInputChange} className="input-field" required />
                  </div>

                  <div>
                    <label className="form-label">Longitude</label>
                    <input type="number" step="any" name="longitude" value={orgFormData.longitude} onChange={handleOrgInputChange} className="input-field" required />
                  </div>
                </div>
              </div>

              {/* Operations */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Operations</h3>
                <div>
                  <label className="form-label">Total Shelter Capacity</label>
                  <input type="number" name="max_capacity" value={orgFormData.max_capacity} onChange={handleOrgInputChange} className="input-field" required min="0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Current occupancy: {orgProfile.current_occupancy || 0}</p>
                </div>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">About Your Shelter</h3>
                <label className="form-label">Description</label>
                <textarea name="description" value={orgFormData.description} onChange={handleOrgInputChange} className="input-field min-h-[120px] pt-4" placeholder="Tell the community about your shelter's mission, services, and story..." required></textarea>
              </div>

              {/* Animal Types */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Animal Types Accepted</h3>
                <div className="flex flex-wrap gap-3">
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

              {/* Submit Button */}
              <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary px-10 py-4 shadow-lg w-full md:w-auto"
                >
                  {saving ? 'Saving Changes...' : 'Save All Changes'}
                </button>
              </div>
            </form>
          )}
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
