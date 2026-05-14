import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { useUI } from '../context/UIContext'

/**
 * SuspendedPage.jsx — Final destination for restricted users
 */
export default function SuspendedPage() {
  const { user, logout } = useAuth()
  const { showToast } = useUI()
  const [appeal, setAppeal] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Determine the state
  const isBanned = user?.is_active === 0 || user?.org_status === 'rejected'
  const needsDocs = user?.org_status === 'more_docs_needed'
  const reason = user?.org_rejection_reason || user?.ban_reason
  const alreadyAppealed = user?.appeal_message || user?.org_appeal_message
  
  const isRestricted = isBanned || needsDocs

  if (user && !isRestricted) {
    window.location.href = '/'
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const handleSubmitAppeal = async (e) => {
    e.preventDefault()
    if (!appeal.trim()) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('message', appeal)
      if (file) formData.append('document', file)

      await authService.submitAppeal(formData)
      showToast('Appeal submitted successfully! We will review it shortly.')
      window.location.reload()
    } catch (err) {
      showToast('Failed to submit appeal', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-20">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-10 md:p-16 text-center">
          <div className="text-6xl mb-8">
             {needsDocs ? '📂' : alreadyAppealed ? '⏳' : '🚫'}
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            {needsDocs ? 'Action Required' : alreadyAppealed ? 'Under Review' : 'Account Restricted'}
          </h1>
          
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            {needsDocs 
              ? "Your shelter registration is almost complete, but we need a few more things from you."
              : alreadyAppealed 
                ? "Your appeal has been received and is currently being processed by our safety team."
                : "Access to your PawLink account has been temporarily suspended by our safety team."}
          </p>

          {!alreadyAppealed && (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-left mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Message from Admin</h3>
              <p className="text-red-700 font-bold italic leading-relaxed">
                "{reason || "No specific reason provided. Please contact support if you believe this is a mistake."}"
              </p>
            </div>
          )}

          {needsDocs ? (
            <div className="space-y-6">
               <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 text-left">
                  <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-1">What to do now?</h4>
                  <p className="text-sm text-primary-800">Please email the requested documents to <span className="font-bold">verify@pawlink.com</span> along with your Shelter ID (#{user?.id}).</p>
               </div>
               <button onClick={handleLogout} className="btn-secondary w-full py-4 text-lg font-bold">Logout & Exit</button>
            </div>
          ) : (
            <div className="space-y-8">
               {alreadyAppealed ? (
                 <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-8 text-left">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white animate-pulse">
                          <span className="text-xl">⌛</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-yellow-800 uppercase tracking-widest">Verification Pending</h4>
                          <p className="text-xs text-yellow-600 font-bold">Estimated review time: 24-48 hours</p>
                        </div>
                      </div>
                      <p className="text-yellow-700 text-sm leading-relaxed">
                        We've received your appeal. Our team is carefully reviewing the information provided. You will receive an email notification once the status of your account changes.
                      </p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary w-full py-4 text-lg font-bold">Logout & Exit</button>
                 </div>
               ) : (
                 <form onSubmit={handleSubmitAppeal} className="space-y-4">
                    <div className="text-left space-y-4 mb-6">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Submit an Appeal</label>
                      <textarea 
                        required
                        value={appeal}
                        onChange={(e) => setAppeal(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary-500 font-medium min-h-[120px]"
                        placeholder="Explain why your account should be reinstated..."
                      ></textarea>
                    </div>

                    <div className="text-left space-y-4 mb-8">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Attach Documents (Optional)</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          onChange={(e) => setFile(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-primary-300 rounded-2xl p-6 transition-all text-center">
                          <span className="text-gray-400 font-bold text-sm">
                            {file ? `📎 ${file.name}` : 'Click or drag to upload supporting files'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="btn-primary w-full py-4 text-lg font-black shadow-lg shadow-primary-500/20 disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send Appeal Request'}
                    </button>
                 </form>
               )}
               
               {!alreadyAppealed && (
                 <button onClick={handleLogout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Logout of PawLink</button>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
