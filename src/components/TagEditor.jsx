import { useState } from 'react'

export default function TagEditor({ tags, onChange, placeholder = 'Добавить тег и Enter' }) {
  const [draft, setDraft] = useState('')

  function addTag() {
    const v = draft.trim()
    if (!v) return
    if (tags.includes(v)) {
      setDraft('')
      return
    }
    onChange([...tags, v])
    setDraft('')
  }

  function removeTag(t) {
    onChange(tags.filter((x) => x !== t))
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-editor">
      {tags.map((t) => (
        <span key={t} className="tag-editor__chip">
          {t}
          <button type="button" onClick={() => removeTag(t)} aria-label={`Удалить ${t}`}>×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={addTag}
        placeholder={placeholder}
      />
    </div>
  )
}
