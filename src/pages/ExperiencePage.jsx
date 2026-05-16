import { useEffect, useState } from 'react'
import { api } from '../api'
import Modal from '../components/Modal'
import TranslateButton from '../components/TranslateButton'

const EMPTY = {
  company: '',
  role: { ru: '', en: '' },
  durationYears: 1,
  order: 0,
}

export default function ExperiencePage({ notify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function refresh() {
    setLoading(true)
    try {
      setItems(await api.listExperience())
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function save() {
    try {
      if (editing._new) await api.createExperience(editing)
      else await api.updateExperience(editing.id, editing)
      notify('Сохранено')
      setEditing(null)
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  async function remove(id) {
    if (!window.confirm('Удалить запись?')) return
    try {
      await api.deleteExperience(id)
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
          <h1>Опыт работы</h1>
          <p className="page-header__hint">Хронология коммерческой разработки</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditing({ ...EMPTY, order: items.length + 1, _new: true })}>+ Добавить</button>
      </div>

      {loading ? <p>Загрузка...</p> : (
        <div className="list">
          {items.map((e) => (
            <div key={e.id} className="card card--row" style={{ gridTemplateColumns: '1fr auto' }}>
              <div>
                <h3 className="card__title">{e.company}</h3>
                <div className="card__sub">
                  <span className="tag">{e.role?.ru || e.role?.en}</span>
                  <span className="tag">{e.durationYears} лет</span>
                </div>
              </div>
              <div className="card__actions">
                <button className="btn btn--small" onClick={() => setEditing({ ...e })}>Редактировать</button>
                <button className="btn btn--small btn--danger" onClick={() => remove(e.id)}>Удалить</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="card__sub">Пусто.</p>}
        </div>
      )}

      {editing && (
        <Modal
          title={editing._new ? 'Новая запись опыта' : 'Редактировать опыт'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditing(null)}>Отмена</button>
              <button className="btn btn--primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div className="field">
            <label>Компания</label>
            <input
              className="input"
              value={editing.company}
              onChange={(ev) => setEditing({ ...editing, company: ev.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            <span className="card__sub" style={{ fontSize: 12 }}>
              ✨ Пустая локаль роли заполнится автоматически при сохранении.
            </span>
            <TranslateButton
              value={{ role: editing.role }}
              from="ru"
              to="en"
              onResult={(next) => setEditing({ ...editing, ...next })}
              notify={notify}
              label="🌐 Перевести роль RU → EN"
            />
          </div>

          <div className="lang-grid">
            <div className="field">
              <label>Роль (RU)</label>
              <input
                className="input"
                value={editing.role?.ru || ''}
                onChange={(ev) => setEditing({ ...editing, role: { ...editing.role, ru: ev.target.value } })}
              />
            </div>
            <div className="field">
              <label>Роль (EN)</label>
              <input
                className="input"
                value={editing.role?.en || ''}
                onChange={(ev) => setEditing({ ...editing, role: { ...editing.role, en: ev.target.value } })}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Длительность, лет</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="input"
                value={editing.durationYears}
                onChange={(ev) => setEditing({ ...editing, durationYears: Number(ev.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label>Порядок</label>
              <input
                type="number"
                className="input"
                value={editing.order ?? 0}
                onChange={(ev) => setEditing({ ...editing, order: Number(ev.target.value) || 0 })}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
