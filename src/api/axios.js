import axios from 'axios'

const api = axios.create({
  baseURL: 'https://ttwreis-backend-2wzl.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ttwreis_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 clear credentials (but don't redirect from login page)
api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('ttwreis_token')
      localStorage.removeItem('ttwreis_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
