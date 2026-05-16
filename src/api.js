export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const TOKEN_KEY = 'pf_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } }
  if (body !== undefined) {
    if (body instanceof FormData) {
      opts.body = body
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }
  if (auth) {
    const token = getToken()
    if (token) opts.headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, opts)
  if (res.status === 401) {
    setToken(null)
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const data = await res.json()
      msg = data.error || msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // auth
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: { username, password }, auth: false }),

  // projects
  listProjects: () => request('/api/projects', { auth: false }),
  createProject: (data) => request('/api/projects', { method: 'POST', body: data }),
  updateProject: (id, data) => request(`/api/projects/${id}`, { method: 'PUT', body: data }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  // skills
  listSkills: () => request('/api/skills', { auth: false }),
  createSkill: (data) => request('/api/skills', { method: 'POST', body: data }),
  updateSkill: (id, data) => request(`/api/skills/${id}`, { method: 'PUT', body: data }),
  deleteSkill: (id) => request(`/api/skills/${id}`, { method: 'DELETE' }),

  // experience
  listExperience: () => request('/api/experience', { auth: false }),
  createExperience: (data) => request('/api/experience', { method: 'POST', body: data }),
  updateExperience: (id, data) => request(`/api/experience/${id}`, { method: 'PUT', body: data }),
  deleteExperience: (id) => request(`/api/experience/${id}`, { method: 'DELETE' }),

  // profile
  getProfile: () => request('/api/profile', { auth: false }),
  updateProfile: (data) => request('/api/profile', { method: 'PUT', body: data }),

  // posts
  listPostsAdmin: () => request('/api/posts/admin'),
  getPost: (id) => request(`/api/posts/${id}`),
  createPost: (data) => request('/api/posts', { method: 'POST', body: data }),
  updatePost: (id, data) => request(`/api/posts/${id}`, { method: 'PUT', body: data }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: 'DELETE' }),

  // translate
  translateText: (text, from, to) =>
    request('/api/translate', { method: 'POST', body: { text, from, to } }),
  translateFields: (fields, from, to) =>
    request('/api/translate', { method: 'POST', body: { fields, from, to } }),

  // comments (admin moderation)
  listAllComments: () => request('/api/comments'),
  deleteComment: (id) => request(`/api/comments/${id}`, { method: 'DELETE' }),

  // uploads
  uploadFile: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return request('/api/uploads', { method: 'POST', body: fd })
  },
}

// Resolve a possibly-relative upload URL to an absolute one for previews.
export function resolveUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/')) return API_URL + url
  return url
}
