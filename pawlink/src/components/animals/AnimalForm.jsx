import { useState } from 'react'
import { animalService } from '../../services/animalService'
import LocationPicker from './LocationPicker'

export default function AnimalForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    type: 'dog',
    breed: '',
    age: '',
    gender: 'unknown',
    rescue_urgency: 'medium',
    description: '',
    latitude: 6.9271,
    longitude: 79.8612,
    city: ''
  })
  const [images, setImages] = useState([])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    images.forEach(img => data.append('images', img))

    try {
      await animalService.create(data)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post animal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-10 text-left">
      {/* Left Column: Basic Info */}
      <div className="space-y-6">
        <div className="card p-8 space-y-6">
          <h2 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-4">Basic Information</h2>
          
          <div>
            <label className="form-label">What kind of animal?</label>
            <div className="flex gap-4">
              {['dog', 'cat', 'other'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${
                    formData.type === t ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Breed / Appearance</label>
            <input 
              type="text" name="breed" className="input-field" 
              placeholder="e.g. Golden Retriever mix" 
              value={formData.breed} onChange={handleChange} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Estimated Age</label>
              <input 
                type="text" name="age" className="input-field" 
                placeholder="e.g. ~2 years" 
                value={formData.age} onChange={handleChange} 
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Rescue Urgency</label>
            <select 
              name="rescue_urgency" 
              className={`input-field font-black ${
                formData.rescue_urgency === 'critical' ? 'text-red-600 bg-red-50 border-red-200' : ''
              }`}
              value={formData.rescue_urgency} 
              onChange={handleChange}
            >
              <option value="low">Low - Safe but needs home</option>
              <option value="medium">Medium - Needs rescue soon</option>
              <option value="high">High - In danger / No food</option>
              <option value="critical">Critical - Injured / Sick</option>
            </select>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-4 mb-6">Photos</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-primary-300 transition-colors cursor-pointer relative">
            <input 
              type="file" multiple accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm font-bold text-gray-400">Click to upload photos</p>
            <p className="text-[10px] text-gray-300 mt-1">Up to 5 images (Max 5MB each)</p>
          </div>
          {images.length > 0 && (
            <p className="mt-4 text-xs font-bold text-primary-600">✅ {images.length} files selected</p>
          )}
        </div>
      </div>

      {/* Right Column: Location & Details */}
      <div className="space-y-6">
        <div className="card p-8">
          <h2 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-4 mb-6">Location Spotted</h2>
          <LocationPicker 
            position={[formData.latitude, formData.longitude]}
            onPositionChange={(pos) => setFormData({ ...formData, latitude: pos[0], longitude: pos[1] })}
          />
          <div className="mt-6">
            <label className="form-label">Nearest City</label>
            <input 
              type="text" name="city" className="input-field" 
              placeholder="e.g. Colombo, Kandy, Galle..." 
              value={formData.city} onChange={handleChange}
              required
            />
            <p className="text-[10px] text-gray-400 mt-2 italic">This helps people find the animal faster on the browse page.</p>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-black text-gray-900 border-b border-gray-50 pb-4 mb-6">Detailed Description</h2>
          <textarea 
            name="description" 
            rows="4" 
            className="input-field resize-none" 
            placeholder="Tell us more about the animal's condition, behavior, and where exactly they were seen..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full py-5 text-xl font-black rounded-3xl shadow-xl hover:shadow-2xl transition-all"
        >
          {loading ? 'Posting Rescue...' : 'Post Animal for Rescue'}
        </button>
      </div>
    </form>
  )
}
