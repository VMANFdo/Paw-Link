import { createContext, useContext, useState, useCallback } from 'react'

const UIContext = createContext()

export function UIProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [dialog, setDialog] = useState({ show: false, title: '', message: '', onConfirm: null, confirmText: 'Confirm', type: 'info' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }, [])

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialog({
        show: true,
        title: options.title || 'Are you sure?',
        message: options.message || 'This action cannot be undone.',
        confirmText: options.confirmText || 'Confirm',
        type: options.type || 'info',
        onConfirm: () => {
          setDialog(prev => ({ ...prev, show: false }))
          resolve(true)
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, show: false }))
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border ${
          toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Global Confirmation Dialog */}
      {dialog.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up text-center p-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 ${
              dialog.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'
            }`}>
              {dialog.type === 'danger' ? '⚠️' : '❓'}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{dialog.title}</h2>
            <p className="text-gray-500 mb-8">{dialog.message}</p>
            <div className="flex gap-4">
              <button onClick={dialog.onCancel} className="flex-1 btn-outline py-4">Cancel</button>
              <button 
                onClick={dialog.onConfirm} 
                className={`flex-1 text-white rounded-2xl font-black transition-colors shadow-lg py-4 ${
                  dialog.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-primary-500 hover:bg-primary-600 shadow-primary-200'
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)
