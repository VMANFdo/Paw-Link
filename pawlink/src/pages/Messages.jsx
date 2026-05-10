import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { messageService } from '../services/messageService'
import { useAuth } from '../context/AuthContext'
import AdoptionRequests from './AdoptionRequests'

/**
 * Messages.jsx — Unified Communication Hub
 * Main tabs: Adoption Requests (default) | Inquiries/Messages
 */
export default function Messages() {
  const { user } = useAuth()
  const location = useLocation()

  // Main tab: 'requests' (default) or 'inquiries'
  const [mainTab, setMainTab] = useState(
    location.state?.defaultTab || 'requests'
  )

  // Inquiries sub-state
  const [view, setView] = useState('inbox') // 'inbox' or 'sent'
  const [messages, setMessages] = useState([])
  const [currentThread, setCurrentThread] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (mainTab === 'inquiries') fetchList()
  }, [view, mainTab])

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = view === 'inbox' ? await messageService.getInbox() : await messageService.getSent()
      setMessages(res.data.data.messages)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMessage = async (msg) => {
    const partnerId = view === 'inbox' ? msg.sender_id : msg.receiver_id
    const partnerName = view === 'inbox' ? msg.sender_name : msg.receiver_name
    try {
      const res = await messageService.getThread(partnerId)
      setCurrentThread({
        userId: partnerId,
        name: partnerName,
        messages: res.data.data.messages
      })
    } catch (err) {
      console.error('Failed to fetch thread', err)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!reply.trim() || !currentThread) return
    setSending(true)
    try {
      await messageService.send({
        receiver_id: currentThread.userId,
        subject: `Re: ${currentThread.messages[0]?.subject || 'Inquiry'}`,
        body: reply
      })
      setReply('')
      const res = await messageService.getThread(currentThread.userId)
      setCurrentThread(prev => ({ ...prev, messages: res.data.data.messages }))
    } catch (err) {
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container-section py-10 flex flex-col" style={{ minHeight: '80vh' }}>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Communication Hub</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your adoption requests and inquiries</p>
        </div>

        {/* Main Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setMainTab('requests')}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              mainTab === 'requests' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🐾 Adoption Requests
          </button>
          <button
            onClick={() => { setMainTab('inquiries'); setCurrentThread(null); }}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              mainTab === 'inquiries' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Inquiries
          </button>
        </div>
      </div>

      {/* ── Adoption Requests Tab ── */}
      {mainTab === 'requests' && (
        <AdoptionRequests isNested={true} />
      )}

      {/* ── Inquiries / Messages Tab ── */}
      {mainTab === 'inquiries' && (
        <div className="flex-grow flex flex-col" style={{ minHeight: '60vh' }}>
          {/* Sub-view toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-6">
            <button
              onClick={() => { setView('inbox'); setCurrentThread(null); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${view === 'inbox' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400'}`}
            >
              Inbox
            </button>
            <button
              onClick={() => { setView('sent'); setCurrentThread(null); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${view === 'sent' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400'}`}
            >
              Sent
            </button>
          </div>

          <div className="flex-grow flex gap-6 overflow-hidden" style={{ minHeight: '50vh' }}>
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 bg-white rounded-3xl border border-gray-100 overflow-y-auto shadow-sm">
              {loading ? (
                <div className="p-10 flex justify-center"><div className="animate-spin h-6 w-6 border-b-2 border-primary-500 rounded-full"></div></div>
              ) : messages.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {messages.map(msg => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`w-full text-left p-6 hover:bg-primary-50/30 transition-colors group ${
                        currentThread?.userId === (view === 'inbox' ? msg.sender_id : msg.receiver_id) ? 'bg-primary-50 border-r-4 border-primary-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-black text-gray-900 truncate">
                          {view === 'inbox' ? msg.sender_name : msg.receiver_name}
                        </p>
                        <span className="text-[10px] text-gray-300 font-bold">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-bold text-primary-600 mb-1">{msg.subject}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 italic">"{msg.body}"</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-300">No {view} yet.</div>
              )}
            </div>

            {/* Thread View */}
            <div className="hidden md:flex flex-1 flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              {currentThread ? (
                <>
                  <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h3 className="font-black text-gray-900">{currentThread.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Conversation History</p>
                  </div>

                  <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/10">
                    {currentThread.messages.map(m => (
                      <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                          m.sender_id === user.id ? 'bg-primary-500 text-white shadow-lg shadow-primary-100' : 'bg-white border border-gray-100 text-gray-700 shadow-sm'
                        }`}>
                          <p className="leading-relaxed">{m.body}</p>
                          <p className={`text-[10px] mt-2 font-bold ${m.sender_id === user.id ? 'text-primary-100' : 'text-gray-300'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendReply} className="p-6 border-t border-gray-50 bg-white">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        className="input-field py-4"
                        placeholder="Type your message..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                      <button disabled={sending} className="btn-primary px-8">
                        {sending ? '...' : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-10 opacity-30">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-xl font-bold">Select an inquiry to view the thread</h2>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
