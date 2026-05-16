import { useEffect, useState } from 'react'
import { api } from '../api'
import Modal from '../components/Modal'

const EMPTY = { name: '', level: 80, category: 'frontend', years: 1 }

const CATEGORIES = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'data', label: 'Data & DevOps' },
]

export default function SkillsPage({ notify }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  async function refresh() {
    setLoading(true)
    try {
      setItems(await api.listSkills())
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function save() {
    try {
      if (editing._new) await api.createSkill(editing)
      else await api.updateSkill(editing.id, editing)
      notify('Сохранено')
      setEditing(null)
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  async function remove(id) {
    if (!window.confirm('Удалить навык?')) return
    try {
      await api.deleteSkill(id)
      notify('Удалено')
      refresh()
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  const filtered = filter === 'all' ? items : items.filter((s) => s.category === filter)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Навыки</h1>
          <p className="page-header__hint">Стек, уровень и опыт по каждой технологии</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditing({ ...EMPTY, _new: true })}>+ Добавить</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`btn btn--small ${filter === 'all' ? 'btn--primary' : ''}`} onClick={() => setFilter('all')}>Все</button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`btn btn--small ${filter === c.id ? 'btn--primary' : ''}`}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? <p>Загрузка...</p> : (
        <div className="list">
          {filtered.map((s) => (
            <div key={s.id} className="card card--row" style={{ gridTemplateColumns: '1fr auto' }}>
              <div>
                <h3 className="card__title">{s.name}</h3>
                <div className="card__sub">
                  <span className="tag">{CATEGORIES.find((c) => c.id === s.category)?.label || s.category}</span>
                  <span className="tag">{s.level}%</span>
                  <span className="tag">{s.years} лет</span>
                </div>
              </div>
              <div className="card__actions">
                <button className="btn btn--small" onClick={() => setEditing({ ...s })}>Редактировать</button>
                <button className="btn btn--small btn--danger" onClick={() => remove(s.id)}>Удалить</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="card__sub">Пусто.</p>}
        </div>
      )}

      {editing && (
        <Modal
          title={editing._new ? 'Новый навык' : 'Редактировать навык'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn" onClick={() => setEditing(null)}>Отмена</button>
              <button className="btn btn--primary" onClick={save}>Сохранить</button>
            </>
          }
        >
          <div className="field">
            <label>Название</label>
            <input
              className="input"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Категория</label>
              <select
                className="select"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Опыт, лет</label>
              <input
                type="number"
                min="0"
                className="input"
                value={editing.years}
                onChange={(e) => setEditing({ ...editing, years: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="field">
            <label>Уровень: {editing.level}%</label>
            <input
              type="range"
              min="0"
              max="100"
              className="range"
              value={editing.level}
              onChange={(e) => setEditing({ ...editing, level: Number(e.target.value) })}
            />
          </div>
        </Modal>
      )}
    </>
  )
}
