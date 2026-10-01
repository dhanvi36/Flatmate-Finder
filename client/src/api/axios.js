import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach JWT + disable browser caching on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Prevent 304 "Not Modified" cached responses
  config.headers['Cache-Control'] = 'no-cache'
  config.headers['Pragma']        = 'no-cache'
  return config
})

// On 401 — clear auth and go to login ONLY if not already there
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const currentPath = window.location.pathname
      // Avoid redirect loop — don't redirect if already on login/register
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
