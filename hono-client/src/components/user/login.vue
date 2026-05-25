<template>
    <div>
        <h4>Welcome back to <b>CommSat</b></h4>
        <br>
        <div class="field-row-stacked" style="margin-bottom: 8px;">
            <label for="login-email">E-mail</label>
            <input
                id="login-email"
                type="text"
                v-model="email"
                @keydown.enter="doLogin"
                style="width: 100%;"
                placeholder="name.surname@commsat.com"
            />
        </div>
        
        <div class="field-row-stacked" style="margin-bottom: 12px;">
            <label for="login-pass">Password</label>
            <input
                id="login-pass"
                type="password"
                v-model="password"
                @keydown.enter="doLogin"
                style="width: 100%;"
            />
        </div>
        
        <div class="field-row" style="justify-content: flex-end; gap: 6px;">
            <button class="default" @click="doLogin" :disabled="loading">
                {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
            <button @click="$emit('register')">Register</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../../js/api.js'
import { fetchUser } from '../../js/user.js'
 
const emit = defineEmits(['logged-in', 'error', 'register'])
 
const email = ref('')
const password = ref('')
const loading = ref(false)
 
async function doLogin() {
    if (!email.value || !password.value) {
        emit('error', 'Please enter email and password.')
        return
    }
    loading.value = true
    try {
        await login(email.value, password.value)
        await fetchUser()
        emit('logged-in')
    } catch (err) {
        emit('error', err.message || 'Login failed.')
    } finally {
        loading.value = false
    }
}
</script>

<style>
</style>