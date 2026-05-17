import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import organizationService from '../services/organizationService'
import { useAuth } from '../context/AuthContext'
import AnimalForm from '../components/animals/AnimalForm'

export default function AddAnimal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checkingStatus, setCheckingStatus] = useState(user?.role === 'organization')

  useEffect(() => {
    if (user?.role === 'organization') {
      checkOrgStatus()
    }
  }, [user])

  const checkOrgStatus = async () => {
    try {
      const res = await organizationService.getMyProfile()
      const org = res.data.data.organization
      if (org.status !== 'approved') {
        navigate('/profile')
      }
    } catch (err) {
      console.error('Failed to check org status', err)
      navigate('/org-setup')
    } finally {
      setCheckingStatus(false)
    }
  }

  if (checkingStatus) return (
    <div className="container py-20 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
    </div>
  )

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Report a Stray 🐾</h1>
        <p className="text-gray-500">Provide as much detail as possible to help rescuers find them.</p>
      </div>

      <AnimalForm onSuccess={() => navigate('/animals')} />
    </div>
  )
}
