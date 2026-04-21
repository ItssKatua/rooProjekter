import { api } from './api.js'

export const currentUser = ref(null);

export const fetchUser = async () => {
    try {
        currentUser.value = await api('/me')
    } catch {
        currentUser.value = null;
    }
}