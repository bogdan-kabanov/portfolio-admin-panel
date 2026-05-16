import { useEffect, useState } from 'react'
import { api } from '../api'
import TranslateButton from '../components/TranslateButton'

const EMPTY = {
  fullName: { ru: '', en: '' },
  role: { ru: '', en: '' },
  email: '',
  phone: '',
  github: '',
  telegram: '',
  githubUsername: '',
}

export default function ProfilePage({ notify }) {
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getProfile()
      .then((d) => setData({ ...EMPTY, ...d, fullName: { ...EMPTY.fullName, ...(d.fullName || {}) }, role: { ...EMPTY.role, ...(d.role || {}) } }))
      .catch((e) => notify(e.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateProfile(data)
      notify('Профиль сохранён')
    } catch (er) {
      notify(er.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <form onSubmit={save}>
      <div className="page-header">
        <div>
          <h1>Профиль</h1>
          <p className="page-header__hint">Имя, роль и контакты, отображаемые на сайте</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
          <span className="card__sub" style={{ fontSize: 12 }}>
            ✨ Пустые поля во второй локали заполнятся автоматически при сохранении.
          </span>
          <TranslateButton
            value={{ fullName: data.fullName, role: data.role }}
            from="ru"
            to="en"
            onResult={(next) => setData({ ...data, ...next })}
            notify={notify}
            label="🌐 Перевести RU → EN"
          />
        </div>

        <div className="lang-grid">
          <div className="field">
            <label>Имя (RU)</label>
            <input
              className="input"
              value={data.fullName?.ru || ''}
              onChange={(e) => setData({ ...data, fullName: { ...data.fullName, ru: e.target.value } })}
            />
          </div>
          <div className="field">
            <label>Имя (EN)</label>
            <input
              className="input"
              value={data.fullName?.en || ''}
              onChange={(e) => setData({ ...data, fullName: { ...data.fullName, en: e.target.value } })}
            />
          </div>
        </div>

        <div className="lang-grid">
          <div className="field">
            <label>Роль (RU)</label>
            <input
              className="input"
              value={data.role?.ru || ''}
              onChange={(e) => setData({ ...data, role: { ...data.role, ru: e.target.value } })}
            />
          </div>
          <div className="field">
            <label>Роль (EN)</label>
            <input
              className="input"
              value={data.role?.en || ''}
              onChange={(e) => setData({ ...data, role: { ...data.role, en: e.target.value } })}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Телефон</label>
            <input
              className="input"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>GitHub URL</label>
            <input
              className="input"
              value={data.github}
              onChange={(e) => setData({ ...data, github: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Telegram URL</label>
            <input
              className="input"
              value={data.telegram}
              onChange={(e) => setData({ ...data, telegram: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label>GitHub username (для секции репозиториев)</label>
          <input
            className="input"
            value={data.githubUsername}
            onChange={(e) => setData({ ...data, githubUsername: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </form>
  )
}
