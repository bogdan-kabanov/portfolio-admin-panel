import { useRef, useState } from 'react'
import { api, resolveUrl } from '../api'
import { renderMarkdown } from '../markdownPreview'

// Markdown editor with a small toolbar. Operates on the underlying textarea
// so the data shape stays a plain markdown string — no extra dependencies,
// no rich-text payload changes, and the existing renderer on the public site
// keeps working unchanged.
//
// Image insertion uploads via the existing /api/uploads endpoint and inserts
// the resulting `![alt](url)` at the cursor.

export default function MarkdownEditor({ value, onChange, placeholder, rows = 16 }) {
  const taRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [tab, setTab] = useState('write') // 'write' | 'preview'
  const [dragOver, setDragOver] = useState(false)

  function focusEnd() {
    const ta = taRef.current
    if (!ta) return
    ta.focus()
  }

  // Insert text at the current selection, or wrap the selection.
  // `before`/`after` wrap; if there's no selection, `placeholder` is used as
  // the inner text so the user can immediately start typing.
  function applyWrap(before, after = before, placeholder = '') {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const v = value || ''
    const selected = v.slice(start, end) || placeholder
    const next = v.slice(0, start) + before + selected + after + v.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      const cursorStart = start + before.length
      const cursorEnd = cursorStart + selected.length
      ta.setSelectionRange(cursorStart, cursorEnd)
    })
  }

  // Insert a snippet that should occupy its own line(s). Adds a leading newline
  // when the cursor isn't already at the start of a line.
  function applyBlock(snippet, cursorOffset = null) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const v = value || ''
    const needsNewline = start > 0 && v[start - 1] !== '\n'
    const insert = (needsNewline ? '\n' : '') + snippet
    const next = v.slice(0, start) + insert + v.slice(ta.selectionEnd)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + (cursorOffset == null ? insert.length : (needsNewline ? 1 : 0) + cursorOffset)
      ta.setSelectionRange(pos, pos)
    })
  }

  // Prefix every line in the current selection (or the current line) with `prefix`.
  function applyLinePrefix(prefix) {
    const ta = taRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const v = value || ''
    // expand selection to full lines
    const lineStart = v.lastIndexOf('\n', start - 1) + 1
    const lineEndIdx = v.indexOf('\n', end)
    const lineEnd = lineEndIdx === -1 ? v.length : lineEndIdx
    const block = v.slice(lineStart, lineEnd)
    const lines = block.length === 0 ? [''] : block.split('\n')
    const prefixed = lines.map((l) => prefix + l).join('\n')
    const next = v.slice(0, lineStart) + prefixed + v.slice(lineEnd)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(lineStart, lineStart + prefixed.length)
    })
  }

  async function uploadAndInsert(file) {
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      const data = await api.uploadFile(file)
      const absolute = resolveUrl(data.url)
      // Use the absolute URL so the image renders correctly even when the
      // markdown is shown on a different origin (preview/blog/etc.).
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')
      const md = `\n\n![${alt}](${absolute})\n\n`
      const ta = taRef.current
      if (!ta) {
        onChange((value || '') + md)
      } else {
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const v = value || ''
        const next = v.slice(0, start) + md + v.slice(end)
        onChange(next)
        requestAnimationFrame(() => {
          ta.focus()
          const pos = start + md.length
          ta.setSelectionRange(pos, pos)
        })
      }
    } catch (e) {
      setErr(e.message || 'Не удалось загрузить файл')
    } finally {
      setBusy(false)
    }
  }

  function onPickImage(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) uploadAndInsert(file)
  }

  function onPaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of items) {
      if (it.type?.startsWith('image/')) {
        e.preventDefault()
        const file = it.getAsFile()
        if (file) uploadAndInsert(file)
        return
      }
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) uploadAndInsert(file)
  }

  function onLink() {
    const url = window.prompt('URL ссылки:', 'https://')
    if (!url) return
    applyWrap('[', `](${url})`, 'текст')
    focusEnd()
  }

  return (
    <div className="md-editor">
      <div className="md-editor__toolbar">
        <button type="button" className="md-editor__btn" title="Жирный (Ctrl+B)" onClick={() => applyWrap('**', '**', 'жирный')}>
          <b>B</b>
        </button>
        <button type="button" className="md-editor__btn" title="Курсив (Ctrl+I)" onClick={() => applyWrap('*', '*', 'курсив')}>
          <i>I</i>
        </button>
        <button type="button" className="md-editor__btn" title="Inline код" onClick={() => applyWrap('`', '`', 'код')}>
          {'<>'}
        </button>
        <span className="md-editor__sep" />
        <button type="button" className="md-editor__btn" title="Заголовок 1" onClick={() => applyLinePrefix('# ')}>H1</button>
        <button type="button" className="md-editor__btn" title="Заголовок 2" onClick={() => applyLinePrefix('## ')}>H2</button>
        <button type="button" className="md-editor__btn" title="Заголовок 3" onClick={() => applyLinePrefix('### ')}>H3</button>
        <span className="md-editor__sep" />
        <button type="button" className="md-editor__btn" title="Маркированный список" onClick={() => applyLinePrefix('- ')}>•</button>
        <button type="button" className="md-editor__btn" title="Нумерованный список" onClick={() => applyLinePrefix('1. ')}>1.</button>
        <button type="button" className="md-editor__btn" title="Цитата" onClick={() => applyLinePrefix('> ')}>❝</button>
        <span className="md-editor__sep" />
        <button type="button" className="md-editor__btn" title="Ссылка" onClick={onLink}>🔗</button>
        <button type="button" className="md-editor__btn" title="Блок кода" onClick={() => applyBlock('```\n\n```\n', 4)}>{'{ }'}</button>
        <label className="md-editor__btn" title="Вставить изображение" style={{ cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>
          {busy ? '…' : '🖼'}
          <input type="file" accept="image/*" onChange={onPickImage} disabled={busy} hidden />
        </label>
        <span className="md-editor__sep" />
        <div className="md-editor__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`md-editor__tab ${tab === 'write' ? 'is-active' : ''}`}
            onClick={() => setTab('write')}
          >
            Текст
          </button>
          <button
            type="button"
            role="tab"
            className={`md-editor__tab ${tab === 'preview' ? 'is-active' : ''}`}
            onClick={() => setTab('preview')}
          >
            Предпросмотр
          </button>
        </div>
      </div>

      {tab === 'write' ? (
        <div
          className={`md-editor__area ${dragOver ? 'is-drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <textarea
            ref={taRef}
            className="textarea md-editor__textarea"
            rows={rows}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onPaste={onPaste}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault()
                applyWrap('**', '**', 'жирный')
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault()
                applyWrap('*', '*', 'курсив')
              }
            }}
            placeholder={placeholder}
          />
          {dragOver && <div className="md-editor__drop-hint">Отпустите, чтобы загрузить</div>}
        </div>
      ) : (
        <div
          className="md-editor__preview"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value || '') }}
        />
      )}

      {err && <div className="error-msg" style={{ marginTop: 8 }}>{err}</div>}
      <div className="md-editor__hint">
        Поддерживается markdown. Картинки можно вставлять через кнопку 🖼, перетаскиванием или из буфера обмена (Ctrl+V).
      </div>
    </div>
  )
}
