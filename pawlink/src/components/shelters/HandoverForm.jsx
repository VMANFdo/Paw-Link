import { useState } from 'react'
import handoverService from '../../services/handoverService'

export default function HandoverForm({ organizationId, orgName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    animal_type: 'dog',
    description: '',
    latitude: '',
    longitude: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await handoverService.createRequest({
        ...formData,
        organization_id: organizationId
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-fade-in-up">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Handover Request 🐾</h2>
          <p className="text-gray-500 text-sm">Requesting help from <span className="text-primary-600 font-bold">{orgName}</span></p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-sm rounded-r-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label block mb-3">What animal did you find?</label>
            <div className="flex gap-2">
              {['dog', 'cat', 'bird', 'other'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, animal_type: type })}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl capitalize transition-all ${
                    formData.animal_type === type 
                      ? 'bg-primary-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Description & Urgency</label>
            <textarea 
              name="description" 
              className="input-field min-h-[100px]" 
              required 
              placeholder="Tell the shelter about the animal's condition and where you found it..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Latitude (Optional)</label>
              <input type="number" step="any" name="latitude" className="input-field" value={formData.latitude} onChange={handleChange} placeholder="e.g. 6.92" />
            </div>
            <div>
              <label className="form-label">Longitude (Optional)</label>
              <input type="number" step="any" name="longitude" className="input-field" value={formData.longitude} onChange={handleChange} placeholder="e.g. 79.86" />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary py-4 rounded-2xl font-black shadow-lg shadow-primary-200" 
            disabled={loading}
          >
            {loading ? 'Sending Request...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
