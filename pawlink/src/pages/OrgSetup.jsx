import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import organizationService from '../services/organizationService'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function OrgSetup() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_number: '',
    address: '',
    latitude: '',
    longitude: '',
    website: '',
    max_capacity: 50,
    animal_types: []
  })

  const animalTypes = ['dog', 'cat', 'bird', 'rabbit', 'other']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTypeToggle = (type) => {
    const current = [...formData.animal_types]
    if (current.includes(type)) {
      setFormData({ ...formData, animal_types: current.filter(t => t !== type) })
    } else {
      setFormData({ ...formData, animal_types: [...current, type] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await organizationService.setupProfile(formData)
      // Refresh user details to get org_profile_complete = 1 and org_status = 'pending'
      const res = await authService.getMe()
      updateUser(res.data.data.user)
      navigate('/org-pending')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete setup.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Shelter Setup 🏢</h1>
        <p className="text-gray-500">Complete your profile to start helping animals.</p>
      </div>

      <div className="card p-8 shadow-xl">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Shelter Name</label>
            <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required placeholder="Official organization name" />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea name="description" className="input-field min-h-[120px]" value={formData.description} onChange={handleChange} placeholder="Tell the community about your mission..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Contact Number</label>
              <input type="tel" name="contact_number" className="input-field" value={formData.contact_number} onChange={handleChange} required />
            </div>
            <div>
              <label className="form-label">Website (Optional)</label>
              <input type="url" name="website" className="input-field" value={formData.website} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="form-label">Full Address</label>
            <input type="text" name="address" className="input-field" value={formData.address} onChange={handleChange} required placeholder="Street address, City" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Latitude</label>
              <input type="number" step="any" name="latitude" className="input-field" value={formData.latitude} onChange={handleChange} required placeholder="e.g. 6.9271" />
            </div>
            <div>
              <label className="form-label">Longitude</label>
              <input type="number" step="any" name="longitude" className="input-field" value={formData.longitude} onChange={handleChange} required placeholder="e.g. 79.8612" />
            </div>
          </div>

          <div>
            <label className="form-label block mb-3">Animal Types Accepted</label>
            <div className="flex flex-wrap gap-2">
              {animalTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                    formData.animal_types.includes(type)
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {type}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Total Shelter Capacity</label>
            <input type="number" name="max_capacity" className="input-field" value={formData.max_capacity} onChange={handleChange} required />
          </div>

          <button type="submit" className="w-full btn-primary py-4 rounded-2xl font-bold shadow-lg" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  )
}
