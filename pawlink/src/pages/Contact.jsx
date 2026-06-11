import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { contactService } from '../services/contactService'
import Rating from '../components/Rating'
import FeedbackStats from '../components/FeedbackStats'

/**
 * Contact.jsx — Enhanced Contact & Feedback Page
 * Route: /contact
 * Access: Public
 * Features: Multi-section form, star rating, feedback stats, dark/light mode
 */

const FEEDBACK_TYPES = [
  { value: 'general', label: 'General Inquiry', icon: '💬' },
  { value: 'bug_report', label: 'Bug Report', icon: '🐛' },
  { value: 'feature_request', label: 'Feature Request', icon: '🚀' },
  { value: 'compliment', label: 'Compliment', icon: '🌟' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const INITIAL_FORM = {
  feedback_type: 'general',
  subject: '',
  message: '',
  priority: 'medium',
  category: '',
  screenshot: null,
}

const INITIAL_ERRORS = {
  subject: '',
  message: '',
}

export default function Contact() {
  const { user } = useAuth()
  const { showToast } = useUI()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState(INITIAL_ERRORS)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  const FAQS = [
    {
      question: 'How do I report a stray animal?',
      answer: 'Go to the "Report a Stray" page where you can pin the exact GPS location, upload up to 5 photos, select the animal type, breed, age, health condition, and urgency level. Your report will immediately appear on the rescue map for nearby shelters and rescuers to see.'
    },
    {
      question: 'What happens after I submit feedback?',
      answer: 'Our team reviews all feedback within 24-48 hours. You\'ll receive a response at the email associated with your account. For bug reports, we prioritize based on severity. Feature requests are added to our roadmap for consideration in future updates.'
    },
    {
      question: 'Can I adopt directly through PawLink?',
      answer: 'Yes! Browse available animals on the "Browse Animals" page, click on any animal to see details, and submit an adoption request. The shelter will review your application and contact you. You can track your adoption request status in your dashboard.'
    },
    {
      question: 'How do I become a verified shelter?',
      answer: 'Register as an organization through the registration page. You\'ll need to provide your shelter details, location, capacity, types of animals accepted, and verification documents. Our admin team reviews applications and approves verified shelters within 3-5 business days.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. We use JWT authentication with secure password hashing (bcrypt). All API communications are over HTTPS. Uploaded files are stored locally with access controls. We never share your personal information with third parties without your consent.'
    },
    {
      question: 'What if I need to update my feedback?',
      answer: 'You can send another message through this form referencing your original submission. Our team will link related submissions. For urgent changes, email support@pawlink.com directly with your reference number.'
    }
  ]

  const validate = () => {
    const newErrors = { subject: '', message: '' }
    let valid = true

    if (!form.subject.trim()) {
      newErrors.subject = 'Subject is required'
      valid = false
    }

    if (!form.message.trim()) {
      newErrors.message = 'Message is required'
      valid = false
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File must be under 5MB', 'error')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('feedback_type', form.feedback_type)
      formData.append('subject', form.subject)
      formData.append('message', form.message)
      formData.append('priority', form.priority)
      if (form.category) formData.append('category', form.category)
      if (selectedFile) formData.append('screenshot', selectedFile)

      await contactService.submitFeedback(formData)
      setSubmitted(true)
      setForm(INITIAL_FORM)
      setSelectedFile(null)
      setPreviewUrl('')
      showToast('Feedback submitted successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      showToast('Please select a rating', 'error')
      return
    }

    setRatingSubmitting(true)
    try {
      await contactService.submitRating({ rating })
      setRatingSubmitted(true)
      showToast('Thank you for rating!')
    } catch (err) {
      console.error('Rating submission error:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to submit rating'
      showToast(msg, 'error')
    } finally {
      setRatingSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-950 dark:to-dark-900 py-16 md:py-24">
        <div className="container-section">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <span className="text-5xl">📬</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Have a question, suggestion, or need help? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white dark:bg-dark-900">
        <div className="container-section">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                /* Success Message */
                <div className="card p-8 md:p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Thank You!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    Your feedback has been received. We review every submission and will get back to you if needed.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                /* Feedback Form */
                <div className="card p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Send us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Feedback Type */}
                    <div>
                      <label className="form-label">What's on your mind?</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {FEEDBACK_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            name="feedback_type"
                            onClick={() => setForm((prev) => ({ ...prev, feedback_type: type.value }))}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              form.feedback_type === type.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-xs font-semibold">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="form-label">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Brief summary of your message"
                        className={`input-field ${errors.subject ? 'ring-2 ring-red-400 border-red-400' : ''}`}
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="form-label">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your feedback, issue, or suggestion..."
                        className={`input-field resize-y min-h-[120px] ${errors.message ? 'ring-2 ring-red-400 border-red-400' : ''}`}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                      )}
                    </div>

                    {/* Priority & Category */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="priority" className="form-label">Priority</label>
                        <select
                          id="priority"
                          name="priority"
                          value={form.priority}
                          onChange={handleChange}
                          className="input-field"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="category" className="form-label">Category (optional)</label>
                        <input
                          id="category"
                          name="category"
                          type="text"
                          value={form.category}
                          onChange={handleChange}
                          placeholder="e.g., Adoption, Rescue, Technical"
                          className="input-field"
                        />
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="form-label">Screenshot (optional, max 5MB)</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedFile ? selectedFile.name : 'Choose file'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {previewUrl && (
                        <div className="mt-3 relative inline-block">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Fields marked with <span className="text-red-500">*</span> are required
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* FAQ Accordion Section */}
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                      {FAQS.map((faq, index) => (
                        <div key={index} className="card overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-inset"
                            aria-expanded={openFaq === index}
                          >
                            <span className="font-medium text-gray-900 dark:text-white pr-4">
                              {faq.question}
                            </span>
                            <svg
                              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                openFaq === index ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openFaq === index && (
                            <div className="px-6 pb-6 pt-0 border-t border-gray-100 dark:border-gray-800/40 animate-fade-in">
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Rating & Contact Info */}
            <div className="space-y-6">
              {/* Rating Section */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Rate Your Experience
                </h3>
                {ratingSubmitted ? (
                  <div className="text-center py-4">
                    <p className="text-green-600 dark:text-green-400 font-semibold mb-2">
                      Thank you for rating! 🎉
                    </p>
                    <Rating initialRating={rating} readOnly size="lg" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      How was your experience with PawLink?
                    </p>
                    <div className="flex justify-center mb-4">
                      <Rating size="lg" onChange={setRating} />
                    </div>
                    <button
                      onClick={handleRatingSubmit}
                      disabled={ratingSubmitting || rating === 0}
                      className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                    >
                      {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Other Ways to Reach Us
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-950/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Email</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">support@pawlink.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-950/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Address</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        123 Animal Rescue Lane<br />
                        Colombo, Sri Lanka
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Response Time</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        We typically respond within 24-48 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Quick Links
                </h3>
                <div className="space-y-3">
                  <a href="/about" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-950 transition-colors">
                    <span className="text-xl">📖</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">About Us</span>
                  </a>
                  <a href="/shelters" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-950 transition-colors">
                    <span className="text-xl">🏪</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Find Shelters</span>
                  </a>
                  <a href="/map" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-950 transition-colors">
                    <span className="text-xl">🗺️</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rescue Map</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-dark-950">
        <div className="container-section">
          <FeedbackStats />
        </div>
      </section>
    </>
  )
}
