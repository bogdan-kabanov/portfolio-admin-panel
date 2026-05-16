import { useEffect } from 'react'

export default function Toast({ message, kind = 'info', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 2400)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className={`toast ${kind === 'error' ? 'toast--error' : ''}`}>
      {message}
    </div>
  )
}
