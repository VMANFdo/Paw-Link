import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { validators } from '../utils/validators'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // Default role
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleRoleToggle = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) return setError('Please enter your full name.')
    if (!validators.isEmail(formData.email)) return setError('Please enter a valid email.')
    if (!validators.isStrongPassword(formData.password)) {
      return setError('Password must be at least 8 characters long.')
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.')
    }

    setLoading(true)
    setError('')

    try {
      // 1. Call API
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      
      // 2. Automatically log them in after registration
      login(response.data.data)

      // 3. Redirect to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="card p-8 w-full max-w-lg shadow-xl border-t-4 border-secondary-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Join PawLink 🐾</h1>
          <p className="text-gray-500">Create an account to help stray animals</p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              formData.role === 'user' ? 'bg-white shadow-md text-primary-600' : 'text-gray-500'
            }`}
            onClick={() => handleRoleToggle('user')}
          >
            I am a Rescuer
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              formData.role === 'shelter' ? 'bg-white shadow-md text-secondary-600' : 'text-gray-500'
            }`}
            onClick={() => handleRoleToggle('shelter')}
          >
            I am a Shelter
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">{formData.role === 'shelter' ? 'Organization Name' : 'Full Name'}</label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder={formData.role === 'shelter' ? 'e.g. Happy Paws Rescue' : 'e.g. John Doe'}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 mt-4 flex items-center justify-center font-bold text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 ${
              formData.role === 'shelter' ? 'bg-secondary-500 hover:bg-secondary-600' : 'bg-primary-500 hover:bg-primary-600'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            ) : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
