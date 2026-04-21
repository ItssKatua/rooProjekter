export const api = async (url, options = {}) => {
  const token = localStorage.getItem('token')

  const res = await fetch(`http://localhost:3000${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.json()
}

export const login = async (emil, heslo) => {
  try {
    const res = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: emil,
        password: heslo
      })
    })

    localStorage.setItem('token', res.token)
    console.log(`user logging in:\nemail: ${emil}\npassword: ${heslo}\ntoken: ${res.token}`);
    
  } catch (err) {
    console.error('Login failed:', err)
  }
}