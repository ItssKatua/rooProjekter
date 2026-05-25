<template>
  <div>
        <h4>Welcome to <b>CommSat</b>!</h4>

    <div class="field-row-stacked" style="margin-bottom: 6px;">
      <label for="reg-fname">First Name</label>
      <input id="reg-fname" type="text" v-model="firstName" style="width: 100%;" />
    </div>

    <div class="field-row-stacked" style="margin-bottom: 6px;">
      <label for="reg-lname">Last Name</label>
      <input id="reg-lname" type="text" v-model="lastName" style="width: 100%;" />
    </div>

    <div class="field-row-stacked" style="margin-bottom: 6px;">
      <label for="reg-email">Email</label>
      <input id="reg-email" type="text" v-model="email" style="width: 100%;" 
            placeholder="name.surname@commsat.com"/>
    </div>

    <div class="field-row-stacked" style="margin-bottom: 6px;">
      <label for="reg-pass">Password</label>
      <input id="reg-pass" type="password" v-model="password" style="width: 100%;" />
    </div>
    <div class="field-row-stacked" style="margin-bottom: 12px;">
      <label for="reg-pass">Confirm Password</label>
      <input id="reg-pass-conf" type="password" v-model="cpassword" style="width: 100%;" />
    </div>

    <div class="field-row" style="justify-content: flex-end; gap: 6px;">
      <button class="default" @click="doRegister" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      <button @click="$emit('login')">Return</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { register } from '../../js/api.js'
import { fetchUser } from '../../js/user.js'

const emit = defineEmits(['registered', 'error', 'login'])

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const cpassword = ref('')
const loading = ref(false)

async function doRegister() {
  if (!firstName.value || !lastName.value || !email.value || !password.value || !cpassword.value) {
    emit('error', 'All fields are required.')
    return
  }
  if (password.value != cpassword.value){
    emit('error', 'Password does not match.')
    return
  }
  loading.value = true
  try {
    await register(firstName.value, lastName.value, email.value, password.value)
    await fetchUser()
    emit('registered')
  } catch (err) {
    emit('error', err.message || 'Registration failed.')
  } finally {
    loading.value = false
  }
}
</script>