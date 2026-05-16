import { useState } from 'react'
import { useAuth } from '../AuthContext'

export default function Login() {
  const { login, loading, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <h1 className="login__title">Admin Panel</h1>
        <p className="login__subtitle">Вход в админку портфолио</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label htmlFor="username">Логин</label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn--primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
