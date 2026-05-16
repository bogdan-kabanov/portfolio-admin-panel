import { useEffect, useState } from 'react'
import { api, resolveUrl } from '../api'
import Modal from '../components/Modal'
import ImageUpload from '../components/ImageUpload'
import ImageGallery from '../components/ImageGallery'
import TagEditor from '../components/TagEditor'
import TranslateButton from '../components/TranslateButton'

const EMPTY = {
  title: { ru: '', en: '' },
  description: { ru: '', en: '' },
  cover: null,
  images: [],
  tech: [],
  order: 0,
}

export default function ProjectsPage({ notify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await api.listProjects()
      setItems(data)
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function startCreate() {
    setEditing({ ...EMPTY, order: items.length + 1, _new: true })
  }
  function startEdit(p) {
    setEditing({ ...EMPTY, ...p })
  }

  async function save() {
    try {
      if (editing._new) {
        await api.createProject(editing)
        notify('Проект создан')
      } else {
        await api.updateProject(editing.id, editing)
        notify('Сохранено')
      }
      setEditing(null)
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  async function remove(id) {
    if (!window.confirm('Удалить проект?')) return
    try {
      await api.deleteProject(id)
      notify('Удалено')
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Проекты</h1>
          <p className="page-header__hint">Управление проектами, отображаемыми на сайте</p>
        </div>
        <button className="btn btn--primary" onClick={startCreate}>+ Новый проект</button>
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
                <div className="card__sub">
                  {p.tech?.slice(0, 5).map((t) => <span key={t} className="tag">{t}</span>)}
                  {p.tech?.length > 5 && <span className="tag">+{p.tech.length - 5}</span>}
                </div>
              </div>
              <div className="card__actions">
                <button className="btn btn--small" onClick={() => startEdit(p)}>Редактировать</button>
                <button className="btn btn--small btn--danger" onClick={() => remove(p.id)}>Удалить</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="card__sub">Пока нет проектов.</p>}
        </div>
      )}

      {editing && (
        <Modal
          title={editing._new ? 'Новый проект' : 'Редактировать проект'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditing(null)}>Отмена</button>
              <button className="btn btn--primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className="card__sub" style={{ fontSize: 12 }}>
              ✨ Пустая локаль (RU/EN) заполнится автоматически при сохранении.
            </span>
            <TranslateButton
              value={{ title: editing.title, description: editing.description }}
              from="ru"
              to="en"
              onResult={(next) => setEditing({ ...editing, ...next })}
              notify={notify}
              label="🌐 Перевести RU → EN"
            />
          </div>

          <div className="lang-grid">
            <div className="field">
              <label>Название (RU)</label>
              <input
                className="input"
                value={editing.title?.ru || ''}
                onChange={(e) => setEditing({ ...editing, title: { ...editing.title, ru: e.target.value } })}
              />
            </div>
            <div className="field">
              <label>Название (EN)</label>
              <input
                className="input"
                value={editing.title?.en || ''}
                onChange={(e) => setEditing({ ...editing, title: { ...editing.title, en: e.target.value } })}
              />
            </div>
          </div>

          <div className="lang-grid">
            <div className="field">
              <label>Описание (RU)</label>
              <textarea
                className="textarea"
                rows={6}
                value={editing.description?.ru || ''}
                onChange={(e) => setEditing({ ...editing, description: { ...editing.description, ru: e.target.value } })}
              />
            </div>
            <div className="field">
              <label>Описание (EN)</label>
              <textarea
                className="textarea"
                rows={6}
                value={editing.description?.en || ''}
                onChange={(e) => setEditing({ ...editing, description: { ...editing.description, en: e.target.value } })}
              />
            </div>
          </div>

          <ImageUpload
            label="Обложка карточки"
            value={editing.cover}
            onChange={(v) => setEditing({ ...editing, cover: v })}
          />

          <ImageGallery
            images={editing.images || []}
            onChange={(imgs) => setEditing({ ...editing, images: imgs })}
          />

          <div className="field">
            <label>Технологии</label>
            <TagEditor
              tags={editing.tech || []}
              onChange={(t) => setEditing({ ...editing, tech: t })}
              placeholder="React, TypeScript..."
            />
          </div>

          <div className="field">
            <label>Порядок</label>
            <input
              type="number"
              className="input"
              value={editing.order ?? 0}
              onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) || 0 })}
            />
          </div>
        </Modal>
      )}
    </>
  )
}
