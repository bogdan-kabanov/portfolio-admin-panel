import { useState } from 'react'
import { api } from '../api'

// Reusable translate trigger.
//
// Two modes:
// 1) Single field — provide `text` and `onResult(translated)`.
// 2) Bilingual object — provide `value={ ru, en }`, `from`, `to`, `onResult(updatedObject)`.
//    Translates only fields that have content in the source language.
//
// Common props:
//   `from` / `to` — language pair (default ru -> en)
//   `notify`      — toast handler from the page
//   `disabled`    — manual disable (e.g. while saving)
//   `label`       — button label override
export default function TranslateButton({
  text,
  value,
  from = 'ru',
  to = 'en',
  onResult,
  notify,
  disabled,
  label,
}) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      // Single-text mode
      if (typeof text === 'string') {
        if (!text.trim()) {
          notify?.('Нечего переводить', 'error')
          return
        }
        const { translated } = await api.translateText(text, from, to)
        onResult(translated)
        notify?.('Переведено')
        return
      }

      // Bilingual-object mode: translate every field that has a source value,
      // then merge into the target locale.
      if (value && typeof value === 'object') {
        const fields = {}
        for (const [key, obj] of Object.entries(value)) {
          if (obj && typeof obj === 'object' && typeof obj[from] === 'string' && obj[from].trim()) {
            fields[key] = obj[from]
          }
        }
        if (Object.keys(fields).length === 0) {
          notify?.(`Нет текста для перевода (${from.toUpperCase()})`, 'error')
          return
        }
        const { translated } = await api.translateFields(fields, from, to)
        const next = { ...value }
        for (const key of Object.keys(translated)) {
          next[key] = { ...(value[key] || {}), [to]: translated[key] }
        }
        onResult(next)
        notify?.('Переведено')
        return
      }

      notify?.('Неверный вызов перевода', 'error')
    } catch (e) {
      notify?.(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="btn btn--small"
      onClick={handleClick}
      disabled={busy || disabled}
      title={`${from.toUpperCase()} → ${to.toUpperCase()}`}
    >
      {busy ? '...' : (label || `🌐 ${from.toUpperCase()} → ${to.toUpperCase()}`)}
    </button>
  )
}
