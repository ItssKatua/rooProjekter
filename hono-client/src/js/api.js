const BASE = 'http://localhost:3000'

export const getToken = () => localStorage.getItem('token')
export const setToken = (t) => localStorage.setItem('token', t)
export const removeToken = () => localStorage.removeItem('token')

export const api = async (url, options = {}) => {
  const token = getToken()
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const login = async (email, password) => {
  const res = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(res.token)
  console.log("user logged in ", email, " ", password);

  return res
}

export const register = async (first_name, last_name, email, password) => {
  const res = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ first_name, last_name, email, password }),
  })
  setToken(res.token)
  console.log("user register ", first_name, " ", last_name, " ", email, " ", password);
  return res
}

export const logout = () => {
  removeToken()
}