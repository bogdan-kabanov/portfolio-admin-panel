import { useState } from 'react'
import { api, resolveUrl } from '../api'

export default function ImageUpload({ value, onChange, label = 'Обложка' }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      const data = await api.uploadFile(file)
      onChange(data.url)
    } catch (er) {
      setErr(er.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="image-upload">
        <div
          className="image-upload__preview"
          style={value ? { backgroundImage: `url(${resolveUrl(value)})` } : undefined}
        />
        <span className="btn btn--small image-upload__btn">
          {busy ? 'Загрузка...' : 'Выбрать файл'}
          <input type="file" accept="image/*" onChange={handleFile} disabled={busy} />
        </span>
        {value && (
          <button type="button" className="btn btn--small btn--ghost" onClick={() => onChange(null)}>
            Удалить
          </button>
        )}
      </div>
      {err && <div className="error-msg" style={{ marginTop: 8 }}>{err}</div>}
    </div>
  )
}
