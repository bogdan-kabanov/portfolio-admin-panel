import { useEffect, useState } from 'react'
import { api, resolveUrl } from '../api'
import Modal from '../components/Modal'
import ImageUpload from '../components/ImageUpload'
import TagEditor from '../components/TagEditor'
import TranslateButton from '../components/TranslateButton'

const EMPTY = {
  title: { ru: '', en: '' },
  excerpt: { ru: '', en: '' },
  content: { ru: '', en: '' },
  cover: null,
  tags: [],
  status: 'draft',
  slug: '',
}

function fmtDate(s) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function PostsPage({ notify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [activeLang, setActiveLang] = useState('ru')

  async function refresh() {
    setLoading(true)
    try {
      setItems(await api.listPostsAdmin())
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  function startCreate() {
    setEditing({ ...EMPTY, _new: true })
    setActiveLang('ru')
  }
  function startEdit(p) {
    setEditing({ ...EMPTY, ...p })
    setActiveLang('ru')
  }

  async function save() {
    try {
      if (editing._new) {
        await api.createPost(editing)
        notify('Пост создан')
      } else {
        await api.updatePost(editing.id, editing)
        notify('Сохранено')
      }
      setEditing(null)
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  async function remove(id) {
    if (!window.confirm('Удалить пост?')) return
    try {
      await api.deletePost(id)
      notify('Удалено')
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  async function toggleStatus(post) {
    try {
      const next = post.status === 'published' ? 'draft' : 'published'
      await api.updatePost(post.id, { ...post, status: next })
      notify(next === 'published' ? 'Опубликовано' : 'Снято с публикации')
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Блог</h1>
          <p className="page-header__hint">Публикации, доступные на сайте</p>
        </div>
        <button className="btn btn--primary" onClick={startCreate}>+ Новый пост</button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="list">
          {items.map((p) => (
            <div key={p.id} className="card card--row">
              <div
                className="thumb"
                style={p.cover ? { backgroundImage: `url(${resolveUrl(p.cover)})` } : undefined}
              >
                {!p.cover && (p.title?.ru || p.title?.en || '?').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="card__title">{p.title?.ru || p.title?.en || '(без названия)'}</h3>
                <div className="card__sub" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                  <span
                    className="tag"
                    style={p.status === 'published'
                      ? { background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }
                      : { background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                  >
                    {p.status === 'published' ? 'Опубликован' : 'Черновик'}
                  </span>
                  <span className="tag">/{p.slug}</span>
                  <span className="tag">{fmtDate(p.publishedAt || p.updatedAt)}</span>
                  <span className="tag">👁 {p.views || 0}</span>
                  <span className="tag">♥ {p.likes || 0}</span>
                  <span className="tag">💬 {p.commentsCount || 0}</span>
                  {p.tags?.slice(0, 4).map((t) => <span key={t} className="tag">#{t}</span>)}
                </div>
              </div>
              <div className="card__actions">
                <button className="btn btn--small" onClick={() => toggleStatus(p)}>
                  {p.status === 'published' ? 'В черновик' : 'Опубликовать'}
                </button>
                <button className="btn btn--small" onClick={() => startEdit(p)}>Редактировать</button>
                <button className="btn btn--small btn--danger" onClick={() => remove(p.id)}>Удалить</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="card__sub">Пока нет постов.</p>}
        </div>
      )}

      {editing && (
        <Modal
          title={editing._new ? 'Новый пост' : 'Редактировать пост'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditing(null)}>Отмена</button>
              <button className="btn btn--primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div className="field-row">
            <div className="field">
              <label>Slug (URL)</label>
              <input
                className="input"
                placeholder="auto"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Статус</label>
              <select
                className="select"
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>
          </div>

          <div className="card__sub" style={{ fontSize: 12, marginBottom: 10 }}>
            ✨ Пустая локаль (заголовок, краткое описание, контент) заполнится автоматически при сохранении.
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn--small ${activeLang === 'ru' ? 'btn--primary' : ''}`}
              onClick={() => setActiveLang('ru')}
            >
              RU
            </button>
            <button
              type="button"
              className={`btn btn--small ${activeLang === 'en' ? 'btn--primary' : ''}`}
              onClick={() => setActiveLang('en')}
            >
              EN
            </button>
            <div style={{ flex: 1 }} />
            <TranslateButton
              value={{ title: editing.title, excerpt: editing.excerpt, content: editing.content }}
              from="ru"
              to="en"
              onResult={(next) => setEditing({ ...editing, ...next })}
              notify={notify}
              label="🌐 Перевести всё RU → EN"
            />
          </div>

          <div className="field">
            <div className="field__header">
              <label>Заголовок ({activeLang.toUpperCase()})</label>
              <TranslateButton
                text={editing.title?.[activeLang === 'ru' ? 'en' : 'ru'] || ''}
                from={activeLang === 'ru' ? 'en' : 'ru'}
                to={activeLang}
                onResult={(t) => setEditing({ ...editing, title: { ...editing.title, [activeLang]: t } })}
                notify={notify}
                label={`🌐 ← ${activeLang === 'ru' ? 'EN' : 'RU'}`}
              />
            </div>
            <input
              className="input"
              value={editing.title?.[activeLang] || ''}
              onChange={(e) => setEditing({ ...editing, title: { ...editing.title, [activeLang]: e.target.value } })}
            />
          </div>

          <div className="field">
            <div className="field__header">
              <label>Краткое описание ({activeLang.toUpperCase()})</label>
              <TranslateButton
                text={editing.excerpt?.[activeLang === 'ru' ? 'en' : 'ru'] || ''}
                from={activeLang === 'ru' ? 'en' : 'ru'}
                to={activeLang}
                onResult={(t) => setEditing({ ...editing, excerpt: { ...editing.excerpt, [activeLang]: t } })}
                notify={notify}
                label={`🌐 ← ${activeLang === 'ru' ? 'EN' : 'RU'}`}
              />
            </div>
            <textarea
              className="textarea"
              rows={2}
              value={editing.excerpt?.[activeLang] || ''}
              onChange={(e) => setEditing({ ...editing, excerpt: { ...editing.excerpt, [activeLang]: e.target.value } })}
            />
          </div>

          <div className="field">
            <div className="field__header">
              <label>Контент ({activeLang.toUpperCase()}) — поддерживается markdown</label>
              <TranslateButton
                text={editing.content?.[activeLang === 'ru' ? 'en' : 'ru'] || ''}
                from={activeLang === 'ru' ? 'en' : 'ru'}
                to={activeLang}
                onResult={(t) => setEditing({ ...editing, content: { ...editing.content, [activeLang]: t } })}
                notify={notify}
                label={`🌐 ← ${activeLang === 'ru' ? 'EN' : 'RU'}`}
              />
            </div>
            <textarea
              className="textarea"
              rows={14}
              style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }}
              value={editing.content?.[activeLang] || ''}
              onChange={(e) => setEditing({ ...editing, content: { ...editing.content, [activeLang]: e.target.value } })}
              placeholder={'# Заголовок\n\nАбзац **с жирным** и `inline code`.\n\n- список\n- ещё пункт'}
            />
          </div>

          <ImageUpload
            label="Обложка"
            value={editing.cover}
            onChange={(v) => setEditing({ ...editing, cover: v })}
          />

          <div className="field">
            <label>Теги</label>
            <TagEditor
              tags={editing.tags || []}
              onChange={(t) => setEditing({ ...editing, tags: t })}
              placeholder="react, design..."
            />
          </div>
        </Modal>
      )}
    </>
  )
}
