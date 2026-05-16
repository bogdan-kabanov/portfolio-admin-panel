import { useState } from 'react'
import { useAuth } from './AuthContext'
import Login from './components/Login'
import Toast from './components/Toast'
import ProjectsPage from './pages/ProjectsPage'
import SkillsPage from './pages/SkillsPage'
import ExperiencePage from './pages/ExperiencePage'
import ProfilePage from './pages/ProfilePage'
import PostsPage from './pages/PostsPage'
import CommentsPage from './pages/CommentsPage'

const SECTIONS = [
  { id: 'projects', label: 'Проекты', component: ProjectsPage },
  { id: 'skills', label: 'Навыки', component: SkillsPage },
  { id: 'experience', label: 'Опыт', component: ExperiencePage },
  { id: 'posts', label: 'Блог', component: PostsPage },
  { id: 'comments', label: 'Комментарии', component: CommentsPage },
  { id: 'profile', label: 'Профиль', component: ProfilePage },
]

export default function App() {
  const { token, logout } = useAuth()
  const [active, setActive] = useState('projects')
  const [toast, setToast] = useState({ message: null, kind: 'info' })

  if (!token) return <Login />

  const Section = SECTIONS.find((s) => s.id === active).component

  function notify(message, kind = 'info') {
    setToast({ message, kind })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">Portfolio · Admin</div>
        <nav className="sidebar__nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`nav-item ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <span className="sidebar__user">Вы вошли как admin</span>
          <button className="btn btn--small" onClick={logout}>Выйти</button>
        </div>
      </aside>
      <main className="main">
        <Section notify={notify} />
      </main>
      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: null, kind: 'info' })}
      />
    </div>
  )
}
