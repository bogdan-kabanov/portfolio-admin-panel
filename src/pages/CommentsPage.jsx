import { useEffect, useState } from 'react'
import { api } from '../api'

function fmt(s) {
  if (!s) return '—'
  try {
    return new Date(s).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return s
  }
}

export default function CommentsPage({ notify }) {
  const [items, setItems] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [comments, postsList] = await Promise.all([
        api.listAllComments(),
        api.listPostsAdmin(),
      ])
      setItems(comments)
      setPosts(postsList)
    } catch (e) {
      notify(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function remove(id) {
    if (!window.confirm('Удалить комментарий?')) return
    try {
      await api.deleteComment(id)
      notify('Удалено')
      setItems((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      notify(e.message, 'error')
    }
  }

  function postTitleFor(c) {
    const post = posts.find((p) => p.id === c.postId)
    return post?.title?.ru || post?.title?.en || c.postId
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Комментарии</h1>
          <p className="page-header__hint">Модерация комментариев со всех постов</p>
        </div>
      </div>

      {loading ? <p>Загрузка...</p> : items.length === 0 ? (
        <p className="card__sub">Пока нет комментариев.</p>
      ) : (
        <div className="list">
          {items.map((c) => (
            <div key={c.id} className="card card--row" style={{ gridTemplateColumns: '1fr auto' }}>
              <div>
                <h3 className="card__title">
                  {c.author?.displayName || '—'}
                  {c.author?.role === 'admin' && (
                    <span className="tag" style={{ marginLeft: 8, background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                      admin
                    </span>
                  )}
                </h3>
                <div className="card__sub" style={{ marginBottom: 8 }}>
                  <span className="tag">{postTitleFor(c)}</span>
                  <span className="tag">{fmt(c.createdAt)}</span>
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.85)' }}>
                  {c.text}
                </p>
              </div>
              <div className="card__actions">
                <button className="btn btn--small btn--danger" onClick={() => remove(c.id)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
