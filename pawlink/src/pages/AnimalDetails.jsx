import { useParams } from 'react-router-dom'

/**
 * AnimalDetails.jsx — Single Animal Detail Page
 * Route: /animals/:id
 * Access: Public
 */
export default function AnimalDetails() {
  const { id } = useParams()

  return (
    <div className="container-section py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Animal Details</h1>
      <p className="text-gray-500">Viewing animal ID: <strong>{id}</strong> — Full implementation in Phase 6.</p>
    </div>
  )
}
