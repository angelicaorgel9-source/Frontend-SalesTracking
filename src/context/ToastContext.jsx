import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'success', duration = 3200) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Icon size={17} />
              <span>{t.message}</span>
              <button className="toast-close" onClick={() => dismiss(t.id)}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
