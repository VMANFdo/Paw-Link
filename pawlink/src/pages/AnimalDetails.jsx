import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { animalService } from '../services/animalService'
import { adoptionService } from '../services/adoptionService'
import { messageService } from '../services/messageService'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'

/**
 * AnimalDetails.jsx — Detailed view for a single animal
 * Features a gallery, detailed information, and adoption request flow.
 */
export default function AnimalDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast, confirm: uiConfirm } = useUI()
  const navigate = useNavigate()

  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [adoptionMessage, setAdoptionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [myRequest, setMyRequest] = useState(null) // { id, status } or null
  
  // Inquiry / Internal Messaging state
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [inquiryBody, setInquiryBody] = useState('')
  const [sendingInquiry, setSendingInquiry] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    type: '', breed: '', age: '', gender: '', 
    rescue_urgency: '', city: '', description: ''
  })
  const [updating, setUpdating] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchAnimal()
  }, [id])

  const fetchAnimal = async () => {
    try {
      const response = await animalService.getById(id)
      const fetchedAnimal = response.data.data.animal
      setAnimal(fetchedAnimal)

      // Check if logged-in user already has a request for this animal
      if (user && fetchedAnimal && user.id !== fetchedAnimal.posted_by) {
        try {
          const checkRes = await adoptionService.check(id)
          setMyRequest(checkRes.data.data.existing)
        } catch (_) {
          // Not fatal — just won't show status badge
        }
      }
    } catch (err) {
      console.error('Failed to fetch animal details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditData({
        type: animal.type,
        breed: animal.breed || '',
        age: animal.age || '',
        gender: animal.gender,
        rescue_urgency: animal.rescue_urgency,
        city: animal.city || '',
        description: animal.description || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await animalService.update(id, editData)
      setIsEditing(false)
      fetchAnimal()
      showToast('Changes saved successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update animal', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    const isConfirmed = await uiConfirm({
      title: 'Delete Post?',
      message: 'This action will permanently remove this post and all associated images. This cannot be undone.',
      confirmText: 'Delete Now',
      type: 'danger'
    })

    if (!isConfirmed) return

    try {
      await animalService.remove(id)
      showToast('Post deleted successfully', 'success')
      navigate('/browse')
    } catch (err) {
      showToast('Failed to delete post. Please try again.', 'error')
    }
  }

  const handleSendInquiry = async (e) => {
    e.preventDefault()
    if (!inquiryBody.trim() || !user) return
    setSendingInquiry(true)
    try {
      await messageService.send({
        receiver_id: animal.posted_by,
        subject: `Inquiry about ${animal.breed || animal.type}`,
        body: inquiryBody
      })
      setInquirySent(true)
      setInquiryBody('')
      setTimeout(() => {
        setShowInquiryModal(false)
        setInquirySent(false)
      }, 2000)
      showToast('Inquiry sent successfully!')
    } catch (err) {
      showToast('Failed to send inquiry. Please try again.', 'error')
    } finally {
      setSendingInquiry(false)
    }
  }

  const handleAdoptClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/animals/${id}` } } })
    } else {
      setShowModal(true)
    }
  }

  const handleSubmitAdoption = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await adoptionService.create({ animal_id: id, message: adoptionMessage })
      setRequestSent(true)
      setTimeout(() => setShowModal(false), 2000)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="container py-20 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-[3rem] mb-8"></div>
      <div className="h-10 bg-gray-200 w-1/3 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 w-2/3 rounded mb-2"></div>
    </div>
  )

  if (!animal) return (
    <div className="container py-20 text-center">
      <h1 className="text-4xl font-bold">Animal not found</h1>
      <Link to="/animals" className="text-primary-600 underline mt-4 inline-block">Back to gallery</Link>
    </div>
  )

  const images = animal.images?.length > 0 
    ? animal.images.map(img => img.image_url)
    : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80']

  const isAuthor = user?.id === animal.posted_by
  const canManage = isAuthor || user?.role === 'admin'

  return (
    <div className="container py-12">
      <Link to="/animals" className="text-sm font-bold text-gray-400 hover:text-gray-900 mb-8 inline-flex items-center group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Gallery
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 mt-4">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-100">
            <img 
              src={images[activeImage]} 
              className="w-full h-full object-cover" 
              alt={animal.breed}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${
                  activeImage === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          {/* Manage Actions (Owner Only) */}
          {canManage && (
            <div className="flex gap-3 p-4 bg-gray-50 rounded-3xl border border-gray-100">
              {isEditing ? (
                <>
                  <button onClick={handleUpdate} disabled={updating} className="btn-primary flex-1 py-3 text-sm">
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={handleEditToggle} className="btn-outline flex-1 py-3 text-sm">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={handleEditToggle} className="btn-outline flex-1 py-3 text-sm flex items-center justify-center gap-2">
                    <span>✏️</span> Edit Post
                  </button>
                  <button onClick={handleDelete} className="btn-outline flex-1 py-3 text-sm text-red-500 hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-2">
                    <span>🗑️</span> Delete
                  </button>
                </>
              )}
            </div>
          )}

          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {isEditing ? (
                <>
                  <select name="type" value={editData.type} onChange={handleEditChange} className="input-field py-1 px-3 w-auto text-xs font-bold uppercase tracking-wider">
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                  <select name="rescue_urgency" value={editData.rescue_urgency} onChange={handleEditChange} className="input-field py-1 px-3 w-auto text-xs font-bold uppercase tracking-wider">
                    <option value="low">Low Urgency</option>
                    <option value="medium">Medium Urgency</option>
                    <option value="high">High Urgency</option>
                    <option value="critical">Critical Urgency</option>
                  </select>
                </>
              ) : (
                <>
                  <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-primary-50 text-primary-600">
                    {animal.type}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider ${
                    animal.rescue_urgency === 'critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {animal.rescue_urgency} Urgency
                  </span>
                </>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input 
                  type="text" name="breed" value={editData.breed} onChange={handleEditChange}
                  className="text-4xl font-black text-gray-900 border-b-2 border-primary-500 w-full focus:outline-none bg-transparent"
                  placeholder="Breed Name"
                />
                <input 
                  type="text" name="city" value={editData.city} onChange={handleEditChange}
                  className="text-xl text-gray-900 border-b border-gray-200 w-full focus:outline-none bg-transparent"
                  placeholder="Nearest City"
                />
              </div>
            ) : (
              <>
                <h1 className="text-5xl font-black text-gray-900 leading-tight mb-2">
                  {animal.breed || animal.type}
                </h1>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${animal.latitude},${animal.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-gray-400 font-medium hover:text-primary-600 transition-colors inline-flex items-center group"
                >
                  <span className="group-hover:scale-110 transition-transform mr-2">📍</span>
                  {animal.city ? `${animal.city} : ` : ''} 
                  Located at {Number(animal.latitude).toFixed(4)}, {Number(animal.longitude).toFixed(4)}
                </a>
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="text-center">
              <div className="text-2xl mb-1">🎂</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Age</div>
              {isEditing ? (
                <input 
                  type="text" name="age" value={editData.age} onChange={handleEditChange}
                  className="text-sm font-bold text-gray-900 w-full text-center bg-white rounded-lg p-1 border border-gray-200"
                  placeholder="e.g. 2 yrs"
                />
              ) : (
                <div className="text-lg font-black text-gray-900">{animal.age || 'Unknown'}</div>
              )}
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-2xl mb-1">⚧</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Gender</div>
              {isEditing ? (
                <select name="gender" value={editData.gender} onChange={handleEditChange} className="text-sm font-bold text-gray-900 w-full bg-white rounded-lg p-1 border border-gray-200">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
              ) : (
                <div className="text-lg font-black text-gray-900 capitalize">{animal.gender}</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🏥</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Status</div>
              <div className="text-lg font-black text-primary-600 capitalize">{animal.status}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-black text-gray-900">About this {animal.type}</h3>
            {isEditing ? (
              <textarea 
                name="description" value={editData.description} onChange={handleEditChange}
                className="input-field min-h-[150px] pt-4"
                placeholder="Describe the animal..."
              ></textarea>
            ) : (
              <p className="text-gray-600 text-lg leading-relaxed">
                {animal.description || 'No detailed description provided for this animal.'}
              </p>
            )}
          </div>

          <div className="p-8 bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center text-white font-bold mr-4 flex-shrink-0 overflow-hidden">
                {animal.org_logo ? (
                  <img src={animal.org_logo} alt={animal.org_name} className="w-full h-full object-cover" />
                ) : (
                  (animal.org_name || animal.poster_name)?.charAt(0)
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Posted by</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-gray-900">{animal.org_name || animal.poster_name}</p>
                  {animal.org_verified === 1 && (
                    <span className="text-blue-500 text-sm" title="Verified Organization">✓</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && user.id !== animal.posted_by && (
                <button 
                  onClick={() => setShowInquiryModal(true)}
                  className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600 text-gray-700 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm"
                >
                  💬 Message
                </button>
              )}

              {animal.poster_phone && (
                <a 
                  href={(function() {
                    let cleaned = animal.poster_phone.replace(/\D/g, '');
                    if (cleaned.startsWith('0') && cleaned.length === 10) cleaned = '94' + cleaned.substring(1);
                    const message = `Hi, I would like to adopt this animal: ${animal.breed || animal.type}`;
                    return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
                  })()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-2xl font-bold transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* ── Adoption Action Area ── */}
          {isAuthor ? (
            <div className="space-y-4">
              {animal.status === 'adopted' && (
                <div className="w-full py-5 text-center rounded-[2rem] font-black text-xl bg-green-50 text-green-600 border-2 border-green-200">
                  🎉 {animal.adopter_name ? `Adopted by ${animal.adopter_name}` : 'Adopted'}
                </div>
              )}
              {animal.status === 'rescued' && (
                <div className="w-full py-5 text-center rounded-[2rem] font-black text-xl bg-blue-50 text-blue-400 border-2 border-blue-100">
                  🚑 This animal has been rescued and is in care
                </div>
              )}
              <div className="p-4 bg-primary-50 rounded-2xl text-center text-primary-700 font-bold text-sm">
                This is your post. You can manage it from your
                <a href="/dashboard" className="underline ml-1">dashboard</a>.
              </div>
            </div>
          ) : user?.role === 'admin' ? (
            <div className="p-4 bg-blue-50 rounded-2xl text-center text-blue-700 font-bold text-sm">
              You are viewing this post as an <strong>Administrator</strong>.
            </div>
          ) : animal.status === 'adopted' ? (
            <div className="w-full py-5 text-center rounded-[2rem] font-black text-xl bg-green-50 text-green-600 border-2 border-green-200">
              🎉 {animal.adopter_name ? `Adopted by ${animal.adopter_name}` : 'Adopted'}
            </div>
          ) : animal.status === 'rescued' ? (
            <div className="w-full py-5 text-center rounded-[2rem] font-black text-xl bg-blue-50 text-blue-400 border-2 border-blue-100">
              🚑 This animal has been rescued and is in care
            </div>
          ) : myRequest ? (
            // User already has a request — show status badge
            <div className={`w-full py-5 px-6 text-center rounded-[2rem] font-black text-xl border-2 ${
              myRequest.status === 'pending'
                ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                : myRequest.status === 'approved'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-red-50 text-red-500 border-red-200'
            }`}>
              {myRequest.status === 'pending' && '⏳ Request Pending — Waiting for approval'}
              {myRequest.status === 'approved' && '🎉 Your adoption has been approved!'}
              {myRequest.status === 'rejected' && '✗ Your request was not approved this time'}
            </div>
          ) : (
            // Available + no prior request — show Adopt button
            <button
              onClick={handleAdoptClick}
              className="btn-primary w-full py-5 text-xl font-black rounded-[2rem] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
            >
              I want to Adopt {animal.breed || animal.type} 🐾
            </button>
          )}
        </div>
      </div>

      {/* Adoption Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 relative z-10 shadow-2xl animate-fade-in-up">
            {!requestSent ? (
              <form onSubmit={handleSubmitAdoption} className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Adoption Request</h2>
                  <p className="text-gray-500">Tell the poster why you'd like to adopt {animal.breed || animal.type}.</p>
                </div>
                <div>
                  <label className="form-label">Your Message</label>
                  <textarea 
                    className="input-field min-h-[150px] pt-3" 
                    placeholder="Describe your home environment, experience with pets, etc."
                    value={adoptionMessage}
                    onChange={(e) => setAdoptionMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1 py-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary flex-1 py-4"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Request Sent!</h2>
                <p className="text-gray-500">Your adoption request has been sent to the poster. You'll be notified when they respond.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Inquiry Modal */}
      <InquiryModal 
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        animal={animal}
        body={inquiryBody}
        setBody={setInquiryBody}
        onSend={handleSendInquiry}
        sending={sendingInquiry}
        sent={inquirySent}
      />
    </div>
  )
}

function InquiryModal({ isOpen, onClose, animal, body, setBody, onSend, sending, sent }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Send Inquiry</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Direct message to poster</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8">
          {sent ? (
            <div className="py-10 text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm">✓</div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm">Your inquiry has been delivered to the poster's inbox.</p>
            </div>
          ) : (
            <form onSubmit={onSend} className="space-y-6">
              <div>
                <label className="form-label text-[10px]">Subject</label>
                <div className="input-field bg-gray-50 text-gray-400 border-none font-bold py-3">
                  Inquiry: {animal.breed || animal.type}
                </div>
              </div>
              <div>
                <label className="form-label">Your Message</label>
                <textarea 
                  className="input-field min-h-[150px] pt-4" 
                  placeholder="Type your question or message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={onClose} className="flex-1 btn-outline py-4">Cancel</button>
                <button type="submit" disabled={sending} className="flex-[2] btn-primary py-4 shadow-lg">
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
