import { ref } from 'vue'
import { api, getToken, logout as apiLogout } from './api.js'

export const currentUser = ref(null)
export const userLoading = ref(false)

export const fetchUser = async () => {
    if (!getToken()) {
        currentUser.value = null
        return null
    }
    userLoading.value = true
    try {
        const me = await api('/employees/me')
        currentUser.value = me
        return me
    } catch {
        currentUser.value = null
        return null
    } finally {
        userLoading.value = false
    }
}

export const updateStatus = async (status) => {
    await api('/employees/me', {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    })
    if (currentUser.value) currentUser.value.status = status
}

export const logout = () => {
    apiLogout()
    currentUser.value = null
}