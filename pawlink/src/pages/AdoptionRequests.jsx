import { useState, useEffect } from 'react'
import { adoptionService } from '../services/adoptionService'
import { Link } from 'react-router-dom'

/**
 * AdoptionRequests.jsx — Management page for adoption requests
 * Features two tabs: Requests Sent (by the user) and Requests Received (for the user's animals).
 */
export default function AdoptionRequests() {
  const [tab, setTab] = useState('received') // 'sent' or 'received'
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [tab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = tab === 'sent' 
        ? await adoptionService.getMine() 
        : await adoptionService.getReceived()
      setRequests(res.data.data.requests)
    } catch (err) {
      console.error('Failed to fetch requests', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return
    try {
      await adoptionService.updateStatus(requestId, status)
      fetchRequests() // Refresh list
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleCancel = async (requestId) => {
    if (!window.confirm('Cancel this adoption request? This cannot be undone.')) return
    try {
      await adoptionService.cancel(requestId)
      fetchRequests() // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request')
    }
  }

  return (
    <div className="container-section py-10">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Adoption Requests</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl w-fit mb-10">
        <button 
          onClick={() => setTab('received')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'received' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received Requests
        </button>
        <button 
          onClick={() => setTab('sent')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'sent' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent Requests
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.length > 0 ? (
            requests.map(req => (
              <RequestCard 
                key={req.id} 
                request={req} 
                isReceived={tab === 'received'} 
                onStatusUpdate={handleStatusUpdate}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <div className="py-20 text-center card bg-gray-50 border-dashed border-2">
              <p className="text-gray-400 font-medium">No requests found in this category.</p>
              <Link to="/animals" className="text-primary-600 font-bold text-sm mt-2 inline-block">Browse animals to adopt</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RequestCard({ request, isReceived, onStatusUpdate, onCancel }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  return (
    <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
          {request.thumbnail ? (
            <img src={`${API_BASE}${request.thumbnail}`} className="w-full h-full object-cover" alt="thumbnail" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">No Image</div>
          )}
        </div>
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h4 className="font-black text-gray-900 text-lg">
              {request.type} ({request.breed})
            </h4>
            <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[request.status]}`}>
              {request.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {isReceived ? (
              <>From: <span className="font-bold text-gray-700">{request.requester_name}</span> ({request.requester_email})</>
            ) : (
              <>Status of your application for this animal</>
            )}
          </p>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 max-w-lg">
            <p className="text-xs text-gray-600 italic">"{request.message}"</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 min-w-[150px]">
        {/* Received tab: Approve / Reject buttons */}
        {isReceived && request.status === 'pending' && (
          <>
            <button 
              onClick={() => onStatusUpdate(request.id, 'approved')}
              className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-green-200"
            >
              ✓ Approve
            </button>
            <button 
              onClick={() => onStatusUpdate(request.id, 'rejected')}
              className="bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition-all"
            >
              ✗ Reject
            </button>
          </>
        )}

        {/* Received tab: Message the requester */}
        {isReceived && (
          <Link
            to="/messages"
            className="text-center text-xs font-bold text-blue-500 hover:text-blue-700 py-2 border-2 border-blue-100 rounded-xl hover:bg-blue-50 transition-all"
          >
            💬 Message
          </Link>
        )}

        {/* Sent tab: Cancel if still pending */}
        {!isReceived && request.status === 'pending' && (
          <button
            onClick={() => onCancel(request.id)}
            className="bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition-all"
          >
            Cancel Request
          </button>
        )}

        {/* View Animal link */}
        <Link 
          to={`/animals/${request.animal_id}`}
          className="text-center text-xs font-bold text-gray-400 hover:text-primary-600 py-1 transition-colors"
        >
          View Animal →
        </Link>
      </div>
    </div>
  )
}
