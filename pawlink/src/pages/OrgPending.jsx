import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { useUI } from '../context/UIContext'

/**
 * OrgPending.jsx — Clean, beautiful status gate for organizations undergoing approval
 */
export default function OrgPending() {
  const { user, logout } = useAuth()
  const { showToast } = useUI()
  const [appeal, setAppeal] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch status variables
  const isPermanentlyBanned = user?.org_is_permanently_banned === 1
  const isRejected = user?.org_status === 'rejected'
  const needsDocs = user?.org_status === 'more_docs_needed'
  const alreadyAppealed = user?.org_appeal_message
  const reason = user?.org_rejection_reason

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
      showToast(needsDocs ? 'Documents uploaded successfully!' : 'Appeal submitted successfully!')
      
      // Fetch fresh profile state to trigger reload & update RestrictionGuard
      const freshUserRes = await authService.getMe()
      // Directly reload to propagate updated user state
      window.location.reload()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit documents', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-20">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-10 md:p-16 text-center">
          
          <div className="text-6xl mb-8">
            {isPermanentlyBanned ? '🚫' : needsDocs ? '📂' : isRejected ? '❌' : '⏳'}
          </div>

          <h1 className="text-4xl font-black text-gray-900 mb-4">
            {isPermanentlyBanned 
              ? 'Account Permanently Suspended' 
              : needsDocs 
                ? 'Additional Documents Required' 
                : isRejected 
                  ? 'Application Rejected' 
                  : 'Application Under Review'}
          </h1>

          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            {isPermanentlyBanned 
              ? "Your organization registration was permanently rejected by our safety team. You can no longer access the shelter dashboard."
              : needsDocs 
                ? "Our administration team reviewed your application and requires a few more details or documents before approval."
                : isRejected 
                  ? "We could not approve your shelter profile at this time based on the details submitted."
                  : alreadyAppealed
                    ? "We have received your updated documents/appeal. Our administrative team will review it shortly."
                    : "Thanks for completing your shelter profile! Our administrative team is reviewing it to verify your organization."}
          </p>

          {/* Admin Note Section */}
          {(reason && !alreadyAppealed) && (
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-left mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Message from Admin</h3>
              <p className="text-orange-700 font-bold italic leading-relaxed">
                "{reason}"
              </p>
            </div>
          )}

          {isPermanentlyBanned ? (
            <div className="space-y-6">
              <button onClick={handleLogout} className="btn-secondary w-full py-4 text-lg font-bold">Logout & Exit</button>
            </div>
          ) : alreadyAppealed ? (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-8 text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white animate-pulse">
                    <span className="text-xl">⌛</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-yellow-800 uppercase tracking-widest">Verification Pending</h4>
                    <p className="text-xs text-yellow-600 font-bold">Estimated review: 24-48 hours</p>
                  </div>
                </div>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  We've received your updated submissions. Our admin team will notify you as soon as the review is complete.
                </p>
              </div>
              <button onClick={handleLogout} className="btn-secondary w-full py-4 text-lg font-bold">Logout & Exit</button>
            </div>
          ) : (
            <div className="space-y-8">
              {(needsDocs || isRejected) ? (
                <form onSubmit={handleSubmitAppeal} className="space-y-4">
                  <div className="text-left space-y-4 mb-6">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">
                      {needsDocs ? 'Provide Requested Details / Explanations' : 'Provide Appeal details'}
                    </label>
                    <textarea 
                      required
                      value={appeal}
                      onChange={(e) => setAppeal(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-5 focus:ring-2 focus:ring-primary-500 font-medium min-h-[120px]"
                      placeholder={needsDocs ? "Type description of the uploaded files or answer admin requests here..." : "Explain why your application should be reviewed..."}
                    ></textarea>
                  </div>

                  <div className="text-left space-y-4 mb-8">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Attach Official Documents / Certificates</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 group-hover:border-primary-300 rounded-2xl p-6 transition-all text-center">
                        <span className="text-gray-400 font-bold text-sm">
                          {file ? `📎 ${file.name}` : 'Click or drag to upload additional documents'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary w-full py-4 text-lg font-black shadow-lg shadow-primary-500/20 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : needsDocs ? 'Submit Additional Documents' : 'Submit Appeal Request'}
                  </button>
                </form>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 text-left mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white animate-pulse">
                      <span className="text-xl">✨</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-blue-800 uppercase tracking-widest font-extrabold">Awaiting Activation</h4>
                      <p className="text-xs text-blue-600 font-bold">Shelter profile setup is complete!</p>
                    </div>
                  </div>
                  <p className="text-blue-700 text-sm leading-relaxed mt-4">
                    Your profile has been submitted and is currently in the moderation queue. We will check your contact details and shelter information to verify your account shortly.
                  </p>
                </div>
              )}
              
              <button onClick={handleLogout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors block mx-auto">
                Logout of PawLink
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
