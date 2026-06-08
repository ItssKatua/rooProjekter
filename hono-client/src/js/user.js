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

/**
 * Apply an SSE employee:admin-updated payload to currentUser if it matches.
 * Called from App.vue which has the global SSE connection.
 */
export const applyAdminUpdate = (data) => {
    if (!currentUser.value || currentUser.value.id !== data.id) return
    if (data.first_name !== undefined) currentUser.value.first_name = data.first_name
    if (data.last_name !== undefined) currentUser.value.last_name = data.last_name
    if (data.email !== undefined) currentUser.value.email = data.email
    if (data.roles !== undefined) currentUser.value.roles = data.roles
    // Re-fetch full profile to get department name etc.
    fetchUser()
}