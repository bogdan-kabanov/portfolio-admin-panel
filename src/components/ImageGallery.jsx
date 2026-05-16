import { useState } from 'react'
import { api, resolveUrl } from '../api'

export default function ImageGallery({ images, onChange }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setBusy(true)
    setErr(null)
    try {
      const uploaded = []
      for (const file of files) {
        const data = await api.uploadFile(file)
        uploaded.push(data.url)
      }
      onChange([...images, ...uploaded])
    } catch (er) {
      setErr(er.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  function removeAt(i) {
    onChange(images.filter((_, idx) => idx !== i))
  }

  return (
    <div className="field">
      <label>Галерея</label>
      <div className="image-grid">
        {images.map((src, i) => (
          <div
            key={src + i}
            className="image-grid__item"
            style={{ backgroundImage: `url(${resolveUrl(src)})` }}
          >
            <button
              type="button"
              className="image-grid__remove"
              onClick={() => removeAt(i)}
              aria-label="Удалить изображение"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <span className="btn btn--small image-upload__btn">
          {busy ? 'Загрузка...' : 'Добавить изображения'}
          <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={busy} />
        </span>
      </div>
      {err && <div className="error-msg" style={{ marginTop: 8 }}>{err}</div>}
    </div>
  )
}
