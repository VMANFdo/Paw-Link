import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const UIContext = createContext()

export function UIProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [dialog, setDialog] = useState({ show: false, title: '', message: '', onConfirm: null, confirmText: 'Confirm', type: 'info' })
  const [promptData, setPromptData] = useState({ show: false, title: '', message: '', placeholder: '', onConfirm: null })

  // Dark Mode Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pawlink-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Synchronize class with root HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('pawlink-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

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

  const prompt = useCallback((options) => {
    return new Promise((resolve) => {
      setPromptData({
        show: true,
        title: options.title || 'Enter Information',
        message: options.message || '',
        placeholder: options.placeholder || '',
        onConfirm: (val) => {
          setPromptData(prev => ({ ...prev, show: false }))
          resolve(val)
        },
        onCancel: () => {
          setPromptData(prev => ({ ...prev, show: false }))
          resolve(null)
        }
      })
    })
  }, [])

  return (
    <UIContext.Provider value={{ showToast, confirm, prompt, theme, toggleTheme }}>
      {children}

      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up border ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-950/80 dark:border-green-900/50 dark:text-green-300' 
            : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/80 dark:border-red-900/50 dark:text-red-300'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Global Confirmation Dialog */}
      {dialog.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up text-center p-10 border border-gray-100 dark:border-gray-800/40">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 ${
              dialog.type === 'danger' 
                ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400' 
                : 'bg-primary-50 text-primary-500 dark:bg-primary-950/40 dark:text-primary-400'
            }`}>
              {dialog.type === 'danger' ? '⚠️' : '❓'}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{dialog.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{dialog.message}</p>
            <div className="flex gap-4">
              <button 
                onClick={dialog.onCancel} 
                className="flex-1 px-5 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-900/50 font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={dialog.onConfirm} 
                className={`flex-1 text-white rounded-xl font-black transition-colors shadow-lg py-4 ${
                  dialog.type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none' 
                    : 'bg-primary-500 hover:bg-primary-600 shadow-primary-200 dark:shadow-none'
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Global Prompt Dialog */}
      {promptData.show && (
        <PromptDialog 
          data={promptData} 
          onClose={() => setPromptData(prev => ({ ...prev, show: false }))} 
        />
      )}
    </UIContext.Provider>
  )
}

function PromptDialog({ data, onClose }) {
  const [val, setVal] = useState('')
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up p-10 border border-gray-100 dark:border-gray-800/40">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{data.title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{data.message}</p>
        <textarea 
          autoFocus
          className="w-full bg-gray-50 dark:bg-dark-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 font-bold mb-6 min-h-[100px] text-gray-900 dark:text-white"
          placeholder={data.placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <div className="flex gap-4">
          <button 
            onClick={() => data.onCancel()} 
            className="flex-1 px-5 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-900/50 font-semibold rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={() => data.onConfirm(val)} 
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black transition-colors shadow-lg shadow-primary-200 dark:shadow-none py-4"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export const useUI = () => useContext(UIContext)
